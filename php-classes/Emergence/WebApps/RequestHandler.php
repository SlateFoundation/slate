<?php

namespace Emergence\WebApps;

use Site;


class RequestHandler extends \Emergence\Site\RequestHandler
{
    public static function handleRequest()
    {
        if (!$appName = static::shiftPath()) {
            return static::throwInvalidRequestError('webapp name required as first path component');
        }

        if (!$app = App::get($appName)) {
            return static::throwNotFoundError('webapp not found');
        }

        return static::handleAppRequest($app);
    }

    public static function handleAppRequest(IApp $app)
    {
        $requestPath = static::getPath();

        // ensure trailing slash
        if (count($requestPath) == 0) {
            Site::redirect(['webapps', $app->getName(), ''], $_GET);
        }

        // render app for requests to /webapps/{appName}/
        if (count($requestPath) == 1 && !$requestPath[0]) {
            return static::sendResponse($app->render());
        }

        $app->renderAsset($requestPath);
    }
}