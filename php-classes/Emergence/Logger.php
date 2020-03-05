<?php

namespace Emergence;

use Emergence\KeyedDiff;
use Emergence\Site\Storage;
use Psr\Log\LogLevel;

class Logger extends \Psr\Log\AbstractLogger
{
    public static $logger; // set from a config script to override general logger instance
    public static $logPath;
    public static $logLevelsWrite = array(
        LogLevel::EMERGENCY
        ,LogLevel::ALERT
        ,LogLevel::CRITICAL
        ,LogLevel::ERROR
        ,LogLevel::WARNING
    );
    public static $logLevelsEmail = array(
        LogLevel::EMERGENCY
        ,LogLevel::ALERT
        ,LogLevel::CRITICAL
    );

    public static function __classLoaded()
    {
        if (!static::$logPath) {
            if (
                ($loggerConfig = \Site::getConfig('logger'))
                && !empty($loggerConfig['root'])
            ) {
                static::$logPath = $loggerConfig['root'];
            } else {
                static::$logPath = Storage::getLocalStorageRoot();
            }

            static::$logPath .= '/site.log';
        }
    }

    // handle logging
    public function log($level, $message, array $context = array())
    {
        \Debug::log(array(
            'level' => $level
            ,'message' => $message
            ,'context' => $context
        ));

        if (in_array($level, static::$logLevelsWrite)) {
            file_put_contents(
                static::$logPath
                ,
                    date('Y-m-d H:i:s')." [$level] $message\n\t"
                    ."context: ".trim(str_replace(PHP_EOL, "\n\t", print_r($context, true)))."\n"
                    ."\tbacktrace:\n\t\t".implode("\n\t\t", static::buildBacktraceLines())
                    ."\n\n"
                ,FILE_APPEND
            );
        }

        if (in_array($level, static::$logLevelsEmail)) {
            \Emergence\Mailer\Mailer::send(
                \Site::$webmasterEmail
                ,"$level logged on $_SERVER[HTTP_HOST]"
                ,'<dl>'
                    .'<dt>Timestamp</dt><dd>'.date('Y-m-d H:i:s').'</dd>'
                    .'<dt>Level</dt><dd>'.$level.'</dd>'
                    .'<dt>Message</dt><dd>'.htmlspecialchars($message).'</dd>'
                    .'<dt>Context</dt><dd><pre>'.htmlspecialchars(print_r($context, true)).'</pre></dd>'
                    .'<dt>Context</dt><dd><pre>'.htmlspecialchars(implode("\n", static::buildBacktraceLines())).'</pre></dd>'
            );
        }
    }

    public static function getLogger()
    {
        if (static::$logger) {
            return static::$logger;
        }

        return static::$logger = new static();
    }

    public static function buildBacktraceLines()
    {
        $backtrace = debug_backtrace();
        $lines = array();

        // trim call to this method
        array_shift($backtrace);

        // build friendly output lines from backtrace frames
        while ($frame = array_shift($backtrace)) {
            if (!empty($frame['file']) && strpos($frame['file'], \Site::$rootPath.'/data/') === 0) {
                $fileNode = \SiteFile::getByID(basename($frame['file']));

                if ($fileNode) {
                    $frame['file'] = 'emergence:'.$fileNode->FullPath;
                }
            }

            // ignore log-routing frames
            if (
                !empty($frame['file']) &&
                (
                    $frame['file'] == 'emergence:_parent/php-classes/Psr/Log/AbstractLogger.php' ||
                    $frame['file'] == 'emergence:_parent/php-classes/Emergence/Logger.php'
                ) ||
                (empty($frame['file']) && !empty($frame['class']) && $frame['class'] == 'Psr\Log\AbstractLogger') ||
                (!empty($frame['class']) && $frame['class'] == 'Emergence\Logger' && !empty($frame['function']) && $frame['function'] == '__callStatic')
            ) {
                continue;
            }

            $lines[] =
                (!empty($frame['class']) ? "$frame[class]$frame[type]" : '')
                .$frame['function']
                .(!empty($frame['args']) ? '('.implode(',', array_map(function($arg) {
                    return is_string($arg) || is_numeric($arg) ? var_export($arg, true) : gettype($arg);
                }, $frame['args'])).')' : '')
                .(!empty($frame['file']) ? " called at $frame[file]:$frame[line]" : '');
        }

        return $lines;
    }

    public static function interpolate($message, array $context = [])
    {
        $replace = [];
        foreach ($context as $key => $value) {
            $replace['{' . $key . '}'] = static::toLogString($value);
        }

        return strtr($message, $replace);
    }

    protected static function toLogString($value)
    {
        if (is_array($value)) {
            $formatted = [];
            foreach ($value as $key => $value) {
                $value = static::toLogString($value);

                if (is_string($key)) {
                    $formatted[] = "{$key} = {$value}";
                }
            }

            return '[ '.implode(', ', $formatted).' ]';
        } elseif (is_bool($value)) {
            // return $value ? '✔' : '✘';
            return $value ? 'T' : 'F';
        } elseif ($value === null) {
            return '∅';
        } elseif ($value instanceof KeyedDiff) {
            $newValues = $value->getNewValues();
            $oldValues = $value->getOldValues();
            $diff = [];

            foreach ($newValues as $key => $newValue) {
                $diff[$key] = sprintf(
                    '%s → %s',
                    $oldValues && isset($oldValues[$key])
                        ? static::toLogString($oldValues[$key])
                        : '⁇',
                    static::toLogString($newValue)
                );
            }

            return static::toLogString($diff);
        }

        return (string)$value;
    }

    // permit log messages for the default logger instance to be called statically by prefixing them with general_
    public static function __callStatic($name, $arguments)
    {
        $logger = static::getLogger();

        if (preg_match('/^general_(.*)$/', $name, $matches) && method_exists($logger, $matches[1])) {
            call_user_func_array(array(&$logger, $matches[1]), $arguments);
        } else {
            throw new \Exception('Undefined logger method');
        }
    }
}