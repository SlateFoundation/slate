<?php

namespace Validators;

class FQDN implements IValidator
{
    const HOSTNAME_INVALID = 'hostname_invalid';

    public static function isInvalid($hostname, array $options = [])
    {
        if (!preg_match('/(?=^.{4,255}$)(^((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63}$)/', $hostname)) {
            return [self::HOSTNAME_INVALID => 'Hostname must be a fully-qualified domain name'];
        }

        return false;
    }
}