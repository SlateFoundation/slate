<?php

/**
 * @deprecated
 * Compatibility layer for Emergence\People\Groups\Group
 */
class Group extends Emergence\People\Groups\Group
{
    public static function __classLoaded()
    {
        Emergence\Logger::general_warning('Deprecated class loaded: '.__CLASS__);
    }
}