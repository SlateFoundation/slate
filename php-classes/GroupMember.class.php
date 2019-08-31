<?php

/**
 * @deprecated
 * Compatibility layer for Emergence\People\Groups\GroupMember
 */
class GroupMember extends Emergence\People\Groups\GroupMember
{
    public static function __classLoaded()
    {
        Emergence\Logger::general_warning('Deprecated class loaded: '.__CLASS__);
    }
}