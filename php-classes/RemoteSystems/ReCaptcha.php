<?php

namespace RemoteSystems;

class ReCaptcha
{
    public static $siteKey;
    public static $secretKey;

    protected static $instance;

    public static function setInstance(\ReCaptcha\ReCaptcha $instance)
    {
        static::$instance = $instance;
    }

    public static function getInstance()
    {
        if (!static::$instance && static::$secretKey) {
            static::$instance = new \ReCaptcha\ReCaptcha(static::$secretKey);
        }

        return static::$instance;
    }
}
