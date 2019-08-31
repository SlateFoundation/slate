<?php

namespace Emergence\RequestHandler;

abstract class AbstractRequestHandler
{
    // configurables
    public static $defaultResponseMode = 'html';
    public static $userResponseModes = []; // array of responseModes that can be selected by the user, with key optionally set to a MIME Type
    public static $beforeRespond;


    // static properties
    protected static $_path;


    // protected static methods
    protected static function setPath(array $path = null)
    {
        static::$_path = isset($path) ? $path : \Site::$pathStack;
    }

    protected static function peekPath()
    {
        if (!isset(static::$_path)) {
            static::setPath();
        }
        return count(static::$_path) ? static::$_path[0] : false;
    }

    protected static function shiftPath()
    {
        if (!isset(static::$_path)) {
            static::setPath();
        }
        return array_shift(static::$_path);
    }

    protected static function getPath()
    {
        if (!isset(static::$_path)) {
            static::setPath();
        }
        return static::$_path;
    }

    protected static function unshiftPath($string)
    {
        if (!isset(static::$_path)) {
            static::setPath();
        }
        return array_unshift(static::$_path, $string);
    }

    public static function getResponseMode()
    {
        if (!empty($_GET['format']) && in_array($_GET['format'], static::$userResponseModes)) {
            return $_GET['format'];
        } elseif (!empty($_SERVER['HTTP_ACCEPT']) && array_key_exists($_SERVER['HTTP_ACCEPT'], static::$userResponseModes)) {
            return static::$userResponseModes[$_SERVER['HTTP_ACCEPT']];
        } else {
            return static::$defaultResponseMode;
        }
    }

    public static function respond($responseId, array $responseData = [], $responseMode = false)
    {
        if (!$responseMode) {
            $responseMode = static::getResponseMode();
        }

        if ($responseMode != 'return') {
            header('X-Response-ID: '.$responseId);
        }

        if (is_callable(static::$beforeRespond)) {
            call_user_func_array(static::$beforeRespond, [$responseId, &$responseData, $responseMode]);
        }

        switch ($responseMode) {
            case 'json':
                return static::respondJson($responseId, $responseData);

            case 'csv':
                return static::respondCsv($responseId, $responseData);

            case 'pdf':
                return static::respondPdf($responseId, $responseData);

            case 'xml':
                return static::respondXml($responseId, $responseData);

            case 'html':
                return static::respondHtml($responseId, $responseData);

            case 'return':
                return [
                    'responseID' => $responseId
                    ,'data' => $responseData
                ];

            default:
                throw new Exception('Invalid response mode');
        }
    }

    public static function respondJson($responseId, array $responseData = [])
    {
        return \JSON::translateAndRespond($responseData, !empty($_GET['summary']), !empty($_GET['include']) ? $_GET['include'] : null);
    }

    public static function respondCsv($responseId, array $responseData = [])
    {
        if (!empty($_REQUEST['downloadToken'])) {
            setcookie('downloadToken', $_REQUEST['downloadToken'], time()+300, '/');
        }

        if (is_array($responseData['data'])) {
            return CSV::respond($responseData['data'], $responseId, !empty($_GET['columns']) ? $_GET['columns'] : null);
        } elseif ($responseId == 'error') {
            print($responseData['message']);
        } else {
            print 'Unable to render data to CSV: '.$responseId;
        }
        exit();
    }

    public static function respondPdf($responseId, array $responseData = [])
    {
        if (!empty($_REQUEST['downloadToken'])) {
            setcookie('downloadToken', $_REQUEST['downloadToken'], time()+300, '/');
        }

        $tmpPath = tempnam('/tmp', 'e_pdf_');

        file_put_contents($tmpPath.'.html', \Emergence\Dwoo\Engine::getSource("$responseId.pdf", $responseData));

        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="'.str_replace('"', '', $responseId).'.pdf"');

        exec("/usr/local/bin/wkhtmltopdf \"$tmpPath.html\" \"$tmpPath.pdf\"");

        if (!file_exists("$tmpPath.pdf")) {
            header('HTTP/1.0 501 Not Implemented');
            die('Unable to generate PDF, check that this system has wkhtmltopdf installed');
        }

        readfile($tmpPath.'.pdf');
        exit();
    }

    public static function respondXml($responseId, array $responseData = [])
    {
        header('Content-Type: text/xml');
        return \Emergence\Dwoo\Engine::respond($responseId, $responseData);
    }

    public static function respondHtml($responseId, array $responseData = [])
    {
        header('Content-Type: text/html; charset=utf-8');
        $responseData['responseID'] = $responseId;
        return \Emergence\Dwoo\Engine::respond($responseId, $responseData);
    }

    public static function throwUnauthorizedError($message = 'You do not have authorization to access this resource')
    {
        if (!$GLOBALS['Session']->Person) {
            $GLOBALS['Session']->requireAuthentication();
        }

        header('HTTP/1.0 403 Forbidden');
        $args = func_get_args();
        $args[0] = $message;
        return call_user_func_array([get_called_class(), 'throwError'], $args);
    }

    public static function throwAPIUnauthorizedError($message = 'You do not have authorization to access this resource')
    {
        header('HTTP/1.0 403 Forbidden');
        switch (static::getResponseMode()) {
            case 'json':
            default:
                JSON::respond([
                    'success' => false
                    ,'message' => $message
                ]);
        }
    }

    public static function throwNotFoundError($message = 'Page not found')
    {
        header('HTTP/1.0 404 Not Found');
        $args = func_get_args();
        $args[0] = $message;
        return call_user_func_array([get_called_class(), 'throwError'], $args);
    }

    public static function throwServerError($message = 'An unknown problem has prevented the server from completing your request')
    {
        header('HTTP/1.0 500 Internal Server Error');
        $args = func_get_args();
        $args[0] = $message;
        return call_user_func_array([get_called_class(), 'throwError'], $args);
    }

    public static function throwValidationError(RecordValidationException $e, $message = 'There were errors validating your submission')
    {
        header('HTTP/1.0 400 Bad Request');
        return static::respond('validationError', [
            'success' => false
            ,'message' => $message
            ,'validationErrors' => $e->recordObject->validationErrors
            ,'recordClass' => get_class($e->recordObject)
            ,'recordID' => $e->recordObject->ID
        ]);
    }

    public static function throwInvalidRequestError($message = 'You did not supply the needed parameters correctly')
    {
        header('HTTP/1.0 400 Bad Request');
        return static::throwError($message);
    }

    public static function throwError($message)
    {
        $args = func_get_args();

        return static::respond('error', [
            'success' => false
            ,'message' => vsprintf($message, array_slice($args, 1))
        ]);
    }
}
