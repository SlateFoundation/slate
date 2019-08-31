<?php

/**
 * @deprecated
 * Compatibility layer for Emergence\Dwoo\Template
 */
class TemplateResource extends Emergence\Dwoo\Template
{
    public static function __classLoaded()
    {
        Emergence\Logger::general_warning('Deprecated class loaded: '.__CLASS__);
    }

    public static function getTemplateNode($path, $throwExceptionOnNotFound = true)
    {
        return static::findNode($path, $throwExceptionOnNotFound);
    }
}