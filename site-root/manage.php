<?php

$GLOBALS['Session']->requireAccountLevel('Staff');

$app = Emergence\WebApps\App::get('SlateAdmin');

Emergence\Site\RequestHandler::sendResponse($app->render(), 'webapps/SlateAdmin');