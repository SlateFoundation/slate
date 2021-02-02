<?php

namespace Emergence\Site;

/**
 * A collection of methods for examining the client interacting with the site
 */
class Client
{
    /**
     * Attempt to determine the IP address of the client, reading across
     * the various places the environment could expose it.
     */
    public static function getAddress()
    {
        if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
            return $_SERVER['HTTP_X_REAL_IP'];
        }

        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            list ($clientIp) = preg_split('/\s*,\s*/', $_SERVER['HTTP_X_FORWARDED_FOR']);
            return $clientIp;
        }

        if (!empty($_SERVER['REMOTE_ADDR'])) {
            return $_SERVER['REMOTE_ADDR'];
        }

        return null;
    }
}
