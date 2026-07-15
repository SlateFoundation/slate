<?php

declare(strict_types=1);

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
