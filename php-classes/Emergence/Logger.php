<?php

namespace Emergence;

class Logger extends \Psr\Log\AbstractLogger
{
    public static $logger; // set from a config script to override general logger instance
    
    // handle logging
    public function log($level, $message, array $context = array())
    {
        \Debug::log(array(
            'level' => $level
            ,'message' => $message
            ,'context' => $context
        ));
    }

    public static function getLogger()
    {
        if (static::$logger) {
            return static::$logger;
        }
        
        return static::$logger = new static();
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