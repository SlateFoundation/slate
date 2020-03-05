<?php

use Emergence\Site\RequestHandler;
use Emergence\WebApps\SenchaApp;

return [
    'title' => 'Update parent tree',
    'description' => 'Scan parent site for updates and deletions to locally cached files to review and pull down',
    'icon' => 'clone',
    'handler' => function () {
        RequestHandler::sendResponse(SenchaApp::load('EmergencePullTool')->render());
    },
];
