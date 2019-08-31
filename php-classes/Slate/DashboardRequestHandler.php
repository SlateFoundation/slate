<?php

namespace Slate;

use Slate\UI\LinkUtil;

class DashboardRequestHandler extends \RequestHandler
{
    public static $sources = [];

    public static function handleRequest()
    {
        $GLOBALS['Session']->requireAuthentication();

        return parent::respond('dashboard', [
            'links' => LinkUtil::mergeSources(static::$sources, get_called_class())
        ]);
    }
}