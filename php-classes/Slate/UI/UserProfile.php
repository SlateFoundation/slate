<?php

namespace Slate\UI;

use Emergence\People\Person;


class UserProfile
{
    public static $sources = [];

    public static function getLinks(Person $Person)
    {
        return LinkUtil::mergeSources(static::$sources, $Person);
    }
}