<?php

/**
 * @deprecated
 * Compatibility layer for Emergence\People\RegistrationRequestHandler
 */
class RegistrationRequestHandler extends Emergence\People\RegistrationRequestHandler
{
    public static function __classLoaded()
    {
        Emergence\Logger::general_warning('Deprecated class loaded: ' . __CLASS__);
    }
}