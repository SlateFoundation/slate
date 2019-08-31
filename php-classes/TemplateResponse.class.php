<?php

/**
 * @deprecated
 * Compatibility layer for Emergence\Dwoo\Engine
 */
class TemplateResponse extends Emergence\Dwoo\Engine
{
    public static $MagicGlobals = array();

    public static function __classLoaded()
    {
        if (!empty(static::$MagicGlobals)) {
            static::$magicGlobals = array_merge(static::$magicGlobals, static::$MagicGlobals);
        }

        Emergence\Logger::general_warning('Deprecated class loaded: '.__CLASS__);
    }
}