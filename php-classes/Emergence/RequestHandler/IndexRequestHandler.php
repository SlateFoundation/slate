<?php

namespace Emergence\RequestHandler;

use Site;
use SiteFile;
use SiteCollection;
use Emergence_FS;


class IndexRequestHandler extends AbstractRequestHandler
{
    public static $userResponseModes = [
        'application/json' => 'json'
    ];

    public static function handleRequest()
    {
        return static::handleIndexRequest();
    }

    public static function handleIndexRequest($requiredAccountLevel = 'Administrator', $path = null)
    {
        if ($requiredAccountLevel) {
            $GLOBALS['Session']->requireAccountLevel('Administrator');
        }

        if ($path === null) {
            $path = Site::$resolvedPath;
        } elseif (is_string($path)) {
            $path = Site::splitPath($path);
        }

        $nodes = Emergence_FS::getAggregateChildren(array_merge(['site-root'], $path));
        ksort($nodes);

        return static::respond('collectionIndex', [
            'path' => '/' . implode('/', $path),
            'nodes' => array_map(function ($node) {
                return [
                    'type' => is_a($node, SiteFile::class) ? 'file' : 'collection',
                    'timestamp' => $node->Timestamp,
                    'type' => $node->Type,
                    'sha1' => $node->SHA1,
                    'size' => (int)$node->Size
                ];
            }, $nodes)
        ]);
    }
}