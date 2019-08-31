<?php

/**
 * @deprecated
 * Compatibility layer for Emergence\People\Groups\Organization
 */
class Organization extends Emergence\People\Groups\Organization
{
    public static function __classLoaded()
    {
        Emergence\Logger::general_warning('Deprecated class loaded: '.__CLASS__);
    }
}