<?php

namespace Validators;

class URL implements IValidator
{
    const URL_INVALID = 'url_invalid';
    const SCHEME_NOT_ALLOWED = 'scheme_not_allowed';

    public static $defaultAllowedSchemes = array('http', 'https');

    public static function isInvalid($url, array $options = array())
    {
        $options = array_merge(array(
            'allowedSchemes' => static::$defaultAllowedSchemes
        ), $options);

        $scheme = parse_url($url, PHP_URL_SCHEME);

        if ($scheme === false) {
            return array(URL_INVALID => 'Not a valid URL');
        }

        if (!in_array(strtolower($scheme), $options['allowedSchemes'])) {
            return array(SCHEME_NOT_ALLOWED => 'URL must start with one of: ' . implode(', ', $options['allowedSchemes']));
        }

        return false;
    }
}