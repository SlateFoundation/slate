<?php

namespace SlateAdmin;


class RequestHandler extends \Emergence\Site\RequestHandler
{
    public static function handleRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');
        return static::sendResponse(WebApp::load()->render());
    }
}