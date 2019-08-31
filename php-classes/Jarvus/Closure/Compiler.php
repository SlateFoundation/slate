<?php

namespace Jarvus\Closure;

class Compiler
{
    /**
     * Install on server:
     *    wget https://dl.google.com/closure-compiler/compiler-latest.zip
     *    unzip -j compiler-latest.zip "compiler.jar" -d /usr/local/bin/
     *    chmod o+r /usr/local/bin/compiler.jar
     */
    public static $jarPath = '/usr/local/bin/compiler.jar';

    public static function getJarPath()
    {
        return static::$jarPath && is_readable(static::$jarPath) ? static::$jarPath : null;
    }
}