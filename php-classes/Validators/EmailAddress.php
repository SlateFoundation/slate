<?php

namespace Validators;

class EmailAddress implements IValidator
{
    public const PARTS_MISSING = 'parts_missing';
    public const USERNAME_INVALID = 'username_invalid';
    public const DOMAIN_INVALID = 'domain_invalid';
    public const DOMAIN_BLACKLISTED = 'domain_blacklisted';

    public static function isInvalid($email, array $options = [])
    {
        $options = array_merge([
            'allowBlacklist' => false
        ], $options);

        $emailParts = explode('@', (string) $email, 2);

        if (count($emailParts) !== 2) {
            return [self::PARTS_MISSING => 'Email address must be in format username@domain'];
        }

        [$username, $domain] = $emailParts;

        if (!preg_match('/^[_a-zA-Z0-9-+]+(\.[_+a-zA-Z0-9-]+)*$/', $username)) {
            return [self::USERNAME_INVALID => 'Username portion of address is invalid'];
        }

        if (!preg_match('/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/', $domain)) {
            return [self::DOMAIN_INVALID => 'Domain portion of address is invalid'];
        }

        if (!$options['allowBlacklist'] && in_array(strtolower($domain), static::$domainBlacklist)) {
            return [self::DOMAIN_BLACKLISTED => 'The email domain is blacklisted'];
        }

        return false;
    }

    // no need to scroll, there's nothing more below this giant list of throwaway email address domains
    public static $domainBlacklist = [];
}
