<?php

/**
 * @deprecated
 * Compatibility layer for Emergence\Dwoo\PluginLoader
 */
class Emergence_Dwoo_Loader extends Emergence\Dwoo\PluginLoader
{
    public static function __classLoaded()
    {
        Emergence\Logger::general_warning('Deprecated class loaded: '.__CLASS__);
    }
}