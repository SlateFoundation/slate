<?php

namespace Emergence\WebApps;

use Exception;

use Site;
use Cache;
use JSON;
use Emergence\Site\Response;
use Emergence\Site\Renderers\DwooTemplate;

class SenchaApp extends App
{
    public static $jsSiteEnvironment = [];
    public static $responseId = 'sencha';
    public static $pluginBuildsRoot = 'webapp-plugin-builds';
    public static $plugins = [];


    protected $manifest;


    public static function load($name)
    {
        $cacheKey = "sencha-app/{$name}";

        // if (!$manifest = Cache::fetch($cacheKey)) {
            // TODO: create cache clear event
            $manifestNode = Site::resolvePath([static::$buildsRoot, $name, 'app.json']);

            if (!$manifestNode) {
                return null;
            }

            $manifest = json_decode(file_get_contents($manifestNode->RealPath), true);

        //     Cache::store($cacheKey, $manifest);
        // }

        return new static($name, $manifest);
    }


    public function __construct($name, array $manifest)
    {
        parent::__construct($name);

        $this->manifest = $manifest;
    }

    protected static function getPlugins()
    {
        return static::$plugins;
    }

    public function render()
    {
        $renderer = DwooTemplate::fromTreeContext('sencha.tpl', ['webapps', $this->name]);

        return new Response(static::$responseId, [
            'app' => $this
        ], $renderer);
    }

    protected function getAsset($path)
    {
        if (is_string($path)) {
            $path = Site::splitPath($path);
        }

        if ($path[0] && $path[0][0] == '~') {
            $pluginName = substr(array_shift($path), 1);

            if (!in_array($pluginName, $this->getPlugins())) {
                throw new Exception('no plugin registered under name: '.$pluginName);
            }

            array_unshift($path, static::$pluginBuildsRoot, $pluginName);
            return Site::resolvePath($path);
        }

        return parent::getAsset($path);
    }

    public function buildCssMarkup()
    {
        $baseUrl = $this->getUrl();

        $html = [];

        foreach ($this->manifest['css'] as $css) {
            $html[] = '<link rel="stylesheet" href="'.$this->getAssetUrl($css['path']).'"/>';
        }

        return implode(PHP_EOL, $html);
    }

    public function buildJsSiteEnvironment()
    {
        global $Session;

        $jsSiteEnvironment = static::$jsSiteEnvironment;

        $jsSiteEnvironment['user'] = $Session ? JSON::translateObjects($Session->Person) : null;
        $jsSiteEnvironment['appName'] = $this->getName();
        $jsSiteEnvironment['appBaseUrl'] = $this->getUrl();

        return $jsSiteEnvironment;
    }

    public function buildDataMarkup()
    {
        $html = [];

        $html[] = '<script type="text/javascript">';
        $html[] = 'window.SiteEnvironment = window.SiteEnvironment || {}';
        $html[] = 'Object.assign(window.SiteEnvironment, '.json_encode($this->buildJsSiteEnvironment()).');';
        $html[] = '</script>';

        return implode(PHP_EOL, $html);
    }

    public function buildJsMarkup()
    {
        $html = [];

        foreach ($this->manifest['js'] as $js) {
            $html[] = '<script type="text/javascript" src="'.$this->getAssetUrl($js['path']).'"></script>';
        }

        // patch manifest paths
        $html[] = '<script type="text/javascript">';
        $html[] = 'window.Ext = window.Ext || {}';
        $html[] = 'Ext.manifest = Ext.manifest || {}';
        $html[] = 'Ext.manifest.resources = Ext.manifest.resources || {}';
        $html[] = 'Ext.manifest.resources.path = '.json_encode($this->getUrl().'/resources');
        $html[] = '</script>';

        // load plugins
        foreach ($this->getPlugins() as $packageName) {
            $html[] = '<script type="text/javascript" src="'.$this->getAssetUrl("~${packageName}/{$packageName}.js").'"></script>';

            try {
                $html[] = '<link rel="stylesheet" type="text/css" href="'.$this->getAssetUrl("~${packageName}/resources/{$packageName}-all.css").'">';
            } catch (Exception $e) {
                // that's ok, not every plugin has CSS
            }
        }

        return implode(PHP_EOL, $html);
    }
}
