<?php

namespace Slate;

class DashboardRequestHandler extends \RequestHandler
{
    static public function handleRequest() {
        $GLOBALS['Session']->requireAuthentication();
        return parent::respond('dashboard');
    }
}