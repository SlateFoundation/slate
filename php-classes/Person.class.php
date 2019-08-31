<?php

/**
 * @deprecated
 * Compatibility layer for Emergence\People\Person
 */
class Person extends Emergence\People\Person
{
    // none of the settings have effect via this shim and are only provided to suppress errors from config files that might set them
    public static $requireEmail = false;
    public static $requirePhone = false;
    public static $requireGender = false;
    public static $requireBirthDate = false;
    public static $requireLocation = false;
    public static $requireAbout = false;

    public static function __classLoaded()
    {
        Emergence\Logger::general_warning('Deprecated class loaded: ' . __CLASS__);

        parent::__classLoaded();

        Emergence\People\Person::$validators['Class']['choices'][] = __CLASS__;
    }
}