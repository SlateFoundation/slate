<?php

class LoginRequestHandler extends RequestHandler
{
    public static $defaultRedirect = '/';
    public static $forceRedirect = false;

    public static $onLoginComplete = false;
    public static $onLogoutComplete = false;

    public static $userResponseModes = array(
        'application/json' => 'json'
    );

    // event templates
    protected static function onLoginComplete(Session $Session, $returnURL)
    {
    }
    protected static function onLogoutComplete(Session $Session, $returnURL)
    {
    }


    public static function handleRequest($returnURL = null)
    {
        if (static::peekPath() == 'json') {
            static::$responseMode = static::shiftPath();
        } elseif ($_REQUEST['format'] == 'json' || $_SERVER['HTTP_ACCEPT'] == 'application/json') {
            static::$responseMode = 'json';
        }

        if (static::peekPath() == 'logout') {
            return static::handleLogoutRequest($returnURL);
        }

        // force login
        $GLOBALS['Session']->requireAuthentication();

        $returnURL = static::getReturnURL($returnURL);

        if (is_callable(static::$onLoginComplete)) {
            call_user_func(static::$onLoginComplete, $GLOBALS['Session'], $returnURL);
        }

        static::onLoginComplete($GLOBALS['Session'], $returnURL);

        // respond
        return static::respond('login/loginComplete', array(
            'success' => true
            ,'data' => $GLOBALS['Session']
            ,'returnURL' => $returnURL
        ));
    }

    public static function handleLogoutRequest($returnURL = null)
    {
        // terminate session
        if (isset($GLOBALS['Session'])) {
            $GLOBALS['Session']->terminate();
        }

        $returnURL = static::getReturnURL($returnURL);

        if (is_callable(static::$onLogoutComplete)) {
            call_user_func(static::$onLogoutComplete, $GLOBALS['Session'], $returnURL);
        }

        static::onLogoutComplete($GLOBALS['Session'], $returnURL);

        // send redirect header
        // respond
        return static::respond('login/logoutComplete', array(
            'success' => true
            ,'returnURL' => static::getReturnURL($returnURL)
        ));
    }

    public static function getReturnURL($returnURL = null)
    {
        if (static::$forceRedirect) {
            return static::$forceRedirect;
        } elseif ($returnURL) {
            return $returnURL;
        } elseif (!empty($_REQUEST['returnUrl'])) {
            return $_REQUEST['returnUrl'];
        } elseif (!empty($_REQUEST['returnURL'])) {
            return $_REQUEST['returnURL'];
        } elseif (!empty($_REQUEST['return'])) {
            return $_REQUEST['return'];
        } elseif (!empty($_SERVER['HTTP_REFERER']) && !preg_match('|^https?://[^/]+/login|i', $_SERVER['HTTP_REFERER'])) {
            return $_SERVER['HTTP_REFERER'];
        } else {
            return (empty($_SERVER['HTTPS']) ? 'http' : 'https').'://'.$_SERVER['HTTP_HOST'].static::$defaultRedirect;
        }
    }
}