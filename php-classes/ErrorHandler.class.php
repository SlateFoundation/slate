<?php

class ErrorHandler extends RequestHandler
{
    // error codes
    const ERROR_DB    = 1;

    public static function handleException(Exception $e)
    {
        switch (get_class($e)) {
            case 'RecordValidationException':
            {
                return static::handleValidationError($e);
            }
            default:
            {
                $report = sprintf("<h1 style='color:red'>%s caught</h1>\n", get_class($e));
                $report .= sprintf("<h2>Details</h2>\n<pre>%s</pre>\n", print_r($e, true));
                $report .= sprintf("<h2>URI</h2>\n<p>%s</p>\n", htmlspecialchars($_SERVER['REQUEST_URI']));
                $report .= sprintf("<h2>_SERVER</h2>\n<pre>%s</pre>\n", print_r($_SERVER, true));

                if ($GLOBALS['Session']->Person) {
                    $report .= sprintf("<h2>User</h2>\n<pre>%s</pre>\n", print_r($GLOBALS['Session']->Person->getData(), true));
                }

                $report .= ErrorHandler::formatBacktrace(debug_backtrace());
                $report .= '<h2>Debug Log</h2><pre>'.print_r(DebugLog::getLog(), true).'</pre>';

                if (Site::$debug) {
                    die($report);
                } else {
                    Email::send(Site::$webmasterEmail, 'Unhandeld '.get_class($e).' on '.$_SERVER['HTTP_HOST'], $report);
                    ErrorHandler::handleFailure('There was a problem... our technical staff has been notified. Please retry later.');
                }

            }
        }
    }

    public static function handleRequest($path = null, $parameters = null)
    {
        return self::handleInvalidRequest();
    }

    public static function handleFailure($message, $code = false)
    {
        header('HTTP/1.0 500 Internal Server Error');
        print('An internal system error occurred: '.$message);
        Site::finishRequest();
    }

    public static function handleNotFound($properNoun = false, $commonNoun = 'page')
    {
        header('HTTP/1.0 404 Not Found');
        printf('The %s you requested "%s" was not found.', $commonNoun, $properNoun);
        Site::finishRequest();
    }

    public static function handleInvalidRequest()
    {
        header('HTTP/1.0 400 Bad Request');
        print('Invalid request');
        Site::finishRequest();
    }

    public static function handleInadaquateAccess($requiredAccountLevel)
    {
        printf('Sorry, you must have %s access to do that', $requiredAccountLevel);
        Site::finishRequest();
    }

    public static function handleValidationError(RecordValidationException $e)
    {
        return static::throwValidationError($e);
    }

    public static function formatBacktrace($backtrace = false)
    {
        if (!$backtrace) {
            $backtrace = debug_backtrace();
        }

        $report = sprintf("<h2>Backtrace</h2>\n");
        $report .= sprintf("<table border='1'>\n");
        $report .= sprintf("<tr><th>Function</th><th>Args</th><th>Object</th><th>File:Line</th></tr>\n");
        foreach ($backtrace AS $track) {
            foreach ($track['args'] AS &$arg) {
                if (is_object($arg)) {
                    $arg = get_class($arg);
                } else {
                    $arg = substr(print_r($arg, true), 0, 100);
                }
            }

            $report .= sprintf(
                '<tr><td>%s<br/>%s%s</td><td>%s</td><td>%s</td><td>%s<br/>Line %s</td></tr>'
                , isset($track['class']) ? $track['class'] : ''
                , isset($track['type']) ? $track['type'] : ''
                , $track['function']
                , join('<hr />', $track['args'])
                , isset($track['object']) ? get_class($track['object']) : ''
                , $track['file']
                , $track['line']
            );
        }
        $report .= sprintf("</table>");

        return $report;
    }

    public static function printBacktrace($backtrace = false, $exit = true)
    {
        echo static::formatBacktrace($backtrace);
        if ($exit) {
            exit();
        }
    }
}


