<?php

declare(strict_types=1);

namespace Slate\UI;

interface ILinksSource
{
    public static function getLinks($context = null);
}
