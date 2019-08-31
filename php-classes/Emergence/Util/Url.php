<?php

namespace Emergence\Util;

use Site;


class Url
{
    public static function buildAbsolute($path = null, $params = null)
    {
        $url = Site::getConfig('ssl') ? 'https' : 'http';
        $url .= '://' . ($_SERVER['HTTP_HOST'] ?: Site::getConfig('primary_hostname'));

        if (is_array($path)) {
            $path = implode($path, '/');
        }

        if ($path = ltrim($path, '/')) {
            $url .= '/' . $path;
        }

        if ($params) {
            $url .= '?' . http_build_query($params);
        }

        return $url;
    }
}