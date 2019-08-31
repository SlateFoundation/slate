<?php

/**
 * @deprecated
 * Compatibility layer for deprecated utility methods
 */
class MICS
{
    public static $SiteName;

    public static function __classLoaded()
    {
        static::$SiteName = Site::$title;

        Emergence\Logger::general_warning('Deprecated class loaded: '.__CLASS__);
    }

    /*
     * TODO: Auto-detect calling class/method for default title
     */
    public static function dump($value, $title = 'Dump', $exit = false, $backtrace = false)
    {
        printf("<h2>%s:</h2><pre>%s</pre>", $title, htmlspecialchars(var_export($value, true)));

        if ($backtrace) {
            print('<hr><pre>');
            debug_print_backtrace();
            print('</pre>');
        }

        if ($exit) {
            exit();
        }

        return $value;
    }

    public static function prepareOptions($value, $defaults = array())
    {
        if (is_string($value)) {
            $value = json_decode($value, true);
        }

        return is_array($value) ? array_merge($defaults, $value) : $defaults;
    }

    public static function terminate()
    {
        Site::finishRequest();
    }

    public static function getApp()
    {
        return Site::$requestPath[0];
    }

    public static function useHTTPS()
    {
    }

    public static function externalRedirect($url, $get = false, $hash = false)
    {
        Site::redirect($url, $get, $hash);
    }

    public static function redirect($path, $get = false, $hash = false)
    {
        Site::redirect($path, $get, $hash);
    }

    public static function getQueryString()
    {
        return $_SERVER['QUERY_STRING'];
    }
}