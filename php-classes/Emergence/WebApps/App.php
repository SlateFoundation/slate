<?php

namespace Emergence\WebApps;

use Exception;

use Site;


abstract class App implements IApp
{
    public static $buildsRoot = 'webapp-builds';
    public static $webappsRoute = '/webapps';
    public static $types = [
        SenchaApp::class
    ];


    protected $name;


    final public static function get($name)
    {
        // check if there's a keyed type for this app
        if (!empty(static::$types[$name])) {
            $type = static::$types[$name];
            return $type::load($name);
        }

        // check if any unkeyed type can load the named app
        foreach (static::$types as $key => $type) {
            // skip any keyed types
            if (is_string($key)) {
                continue;
            }

            if (!is_a($type, IApp::class, true)) {
                throw new Exception("app type $type does not implement IApp interface");
            }

            if ($app = $type::load($name)) {
                return $app;
            }
        }

        return null;
    }


    public function __construct($name)
    {
        $this->name = $name;
    }

    public function getName()
    {
        return $this->name;
    }

    public function getUrl()
    {
        return static::$webappsRoute . '/' . $this->getName();
    }

    protected function getAsset($path)
    {
        if (is_string($path)) {
            $path = Site::splitPath($path);
        }

        array_unshift($path, static::$buildsRoot, $this->name);

        return Site::resolvePath($path);
    }

    protected function getAssetUrl($path)
    {
        $node = $this->getAsset($path);

        if (!is_string($path)) {
            $path = implode('/', $path);
        }

        if (!$node) {
            throw new Exception('asset not found: '.$path);
        }

        return $this->getUrl()."/{$path}?_sha1={$node->SHA1}";
    }

    public function renderAsset($path)
    {
        $assetNode = $this->getAsset($path);

        if (!$assetNode) {
            header('HTTP/1.0 404 Not Found');
            die('asset not found: '.implode('/', $path));
        }

        $assetNode->outputAsResponse();
    }
}