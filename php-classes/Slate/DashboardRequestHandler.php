<?php

namespace Slate;

class DashboardRequestHandler extends \RequestHandler
{
    public static function handleRequest() {
        $GLOBALS['Session']->requireAuthentication();
        return parent::respond('dashboard');
    }
}