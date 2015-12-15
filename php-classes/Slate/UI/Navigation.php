<?php

namespace Slate\UI;

class Navigation
{
    public static $sources = [];
    public static $links = [];

    public static function getLinks()
    {
        $sources = static::$sources;

        if (!empty(static::$links)) {
            array_unshift($sources, static::$links);
        }

        return LinkUtil::mergeSources($sources, get_called_class());
    }
}