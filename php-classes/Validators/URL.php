<?php

namespace Validators;

class URL implements IValidator
{
    public const URL_INVALID = 'url_invalid';
    public const SCHEME_NOT_ALLOWED = 'scheme_not_allowed';

    public static $defaultAllowedSchemes = ['http', 'https'];

    public static function isInvalid($url, array $options = [])
    {
        $options = array_merge([
            'allowedSchemes' => static::$defaultAllowedSchemes
        ], $options);

        $scheme = parse_url((string) $url, PHP_URL_SCHEME);

        if ($scheme === false) {
            return [self::URL_INVALID => 'Not a valid URL'];
        }

        if (!in_array(strtolower((string) $scheme), $options['allowedSchemes'])) {
            return [self::SCHEME_NOT_ALLOWED => 'URL must start with one of: '.implode(', ', $options['allowedSchemes'])];
        }

        return false;
    }
}
