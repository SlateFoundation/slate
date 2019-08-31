<?php

namespace Emergence\Database;

abstract class AbstractConnectionSingleton implements ConnectionSingletonInterface
{
    public static function getConnection()
    {
        $connectionClass = static::$connectionClass;
        return $connectionClass::getDefaultInstance();
    }

    public static function __callStatic($method, $arguments)
    {
        return call_user_func_array([static::getConnection(), $method], $arguments);
    }
}
