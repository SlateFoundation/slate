<?php

namespace Emergence\Mailer;

class Mailer
{
    public static $defaultImplementation = PHPMailer::class;
    public static $defaultFrom;

    public static function __callStatic($name, $args)
    {
        return call_user_func_array(array(static::$defaultImplementation, $name), $args);
    }
}