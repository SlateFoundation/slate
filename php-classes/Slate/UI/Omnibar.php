<?php

namespace Slate\UI;

class Omnibar
{
    public static $sources = [];
    public static $preferredIconSize = 48;

    public static function getLinks()
    {
        return LinkUtil::mergeSources(static::$sources, get_called_class());
    }
}