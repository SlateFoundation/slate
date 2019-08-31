<?php

function Dwoo_Plugin_versioned_url(Dwoo_Core $dwoo, $path, $source = 'site-root', $includeHost = false, $absolute = false)
{
    $trimmedPath = ltrim($path, '/');

    if ($source == 'site-root') {
        $url = Site::getVersionedRootUrl($trimmedPath);

        if ($includeHost || $absolute) {
            $url = Emergence\Util\Url::buildAbsolute($url);
        }

        return $url;
    } else {
        return $path;
    }
}