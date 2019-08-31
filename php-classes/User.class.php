<?php

/**
 * @deprecated
 * Compatibility layer for Emergence\People\Person
 */
class User extends Emergence\People\User
{
    // none of the settings have effect via this shim and are only provided to suppress errors from config files that might set them
    public static $requireEmail = true;

    public static function __classLoaded()
    {
        Emergence\Logger::general_warning('Deprecated class loaded: ' . __CLASS__);

        parent::__classLoaded();

        Emergence\People\Person::$validators['Class']['choices'][] = __CLASS__;
    }
}