<?php

namespace Emergence\WebApps;

use Exception;

use Site;
use SiteFile;
use JSON;
use Emergence\Site\Response;
use Emergence\Site\Renderers\StaticContent;

class IndexApp extends App
{
    public static $responseId = 'webapp-index';
    public static $indexFilename = 'index.html';


    public static function load($name)
    {
        $indexNode = Site::resolvePath([static::$buildsRoot, $name, static::$indexFilename]);

        if (!$indexNode) {
            return null;
        }

        return new static($name, $indexNode);
    }


    public function __construct($name, \SiteFile $indexNode)
    {
        parent::__construct($name);

        $this->indexNode = $indexNode;
    }

    public function render()
    {
        return new Response(static::$responseId, [
            'node' => $this->indexNode
        ], new StaticContent);
    }
}
