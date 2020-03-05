<?php

namespace Emergence\FS;

use Emergence\Git\HttpBackend;
use Site;

class SiteRepositoryRequestHandler extends \RequestHandler
{
    /**
     * Default route synchronizes and serves up primary site repository.
     */
    public static function handleRequest()
    {
        HttpBackend::requireAuthentication();

        set_time_limit(0);

        // get site repository and synchronize
        $repo = new SiteRepository();
        $repo->synchronize();

        // continue with generic repository request
        return HttpBackend::handleRepositoryRequest($repo, static::getPath());
    }
}
