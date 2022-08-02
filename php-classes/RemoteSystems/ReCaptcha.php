<?php

namespace RemoteSystems;

class ReCaptcha
{
    public static $siteKey;
    public static $secretKey;
    public static $scoreThreshold = 0.5;

    protected static $instance;

    public static function setInstance(\ReCaptcha\ReCaptcha $instance)
    {
        static::$instance = $instance;
    }

    public static function getInstance()
    {
        if (!static::$instance && static::$secretKey) {
            static::$instance = new \ReCaptcha\ReCaptcha(static::$secretKey);
            static::$instance->setScoreThreshold(static::$scoreThreshold);
        }

        return static::$instance;
    }
}
