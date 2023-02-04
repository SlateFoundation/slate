<?php

namespace Emergence\WebApps;

use DOMDocument;
use Exception;

use Site;
use Cache;
use JSON;
use Emergence\Site\Response;
use Emergence\Site\Renderers\DwooTemplate;

class VueApp extends App
{
    public static $responseId = 'vueapp-index';
    public static $indexFilename = 'index.html';
    public static $jsSiteEnvironment = [];


    protected $indexDoc;


    public static function load($name)
    {
        $indexNode = Site::resolvePath([static::$buildsRoot, $name, static::$indexFilename]);

        if (!$indexNode) {
            return null;
        }

        $indexDoc = new DOMDocument();
        $indexDoc->loadHTMLFile($indexNode->RealPath);

        return new static($name, $indexDoc);
    }


    public function __construct($name, DOMDocument $indexDoc)
    {
        parent::__construct($name);

        $this->indexDoc = $indexDoc;
    }

    public function render()
    {
        $renderer = DwooTemplate::fromTreeContext('vue.tpl', ['webapps', $this->name]);

        return new Response(static::$responseId, [
            'app' => $this
        ], $renderer);
    }

    public function buildCssMarkup()
    {
        $html = [];

        foreach ($this->indexDoc->getElementsByTagName('link') as $element) {
            if ($href = $element->getAttribute('href')) {
                $href = parse_url($href, PHP_URL_PATH);
                $href = $this->getAssetUrl($href);
                $element->setAttribute('href', $href);
            }

            $html[] = $this->indexDoc->saveXML($element);
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

        foreach ($this->indexDoc->getElementsByTagName('script') as $element) {
            if ($src = $element->getAttribute('src')) {
                $src = parse_url($src, PHP_URL_PATH);
                $src = $this->getAssetUrl($src);
                $element->setAttribute('src', $src);
            }

            $html[] = $this->indexDoc->saveXML($element, LIBXML_NOEMPTYTAG);
        }

        return implode(PHP_EOL, $html);
    }
}
