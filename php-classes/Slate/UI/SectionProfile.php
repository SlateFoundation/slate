<?php

declare(strict_types=1);

namespace Slate\UI;

use Slate\Courses\Section;


class SectionProfile
{
    public static $sources = [];

    public static function getLinks(Section $Section)
    {
        return LinkUtil::mergeSources(static::$sources, $Section);
    }
}
