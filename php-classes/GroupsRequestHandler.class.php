<?php

/**
 * @deprecated
 * Compatibility layer for Emergence\People\Groups\GroupsRequestHandler
 */
class GroupsRequestHandler extends Emergence\People\Groups\GroupsRequestHandler
{
    public static function __classLoaded()
    {
        Emergence\Logger::general_warning('Deprecated class loaded: '.__CLASS__);
    }
}