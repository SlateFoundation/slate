<?php

namespace Emergence\CMS;

use Media;

class WebApp extends \Emergence\WebApps\SenchaApp
{
    public static $plugins = [];
    public static $composers = [
        // 'html',
        'markdown',
        'multimedia',
        'embed'
    ];


    public static function load($name = 'EmergenceContentEditor')
    {
        return parent::load($name);
    }

    protected static function getComposers()
    {
        return static::$composers;
    }

    public function buildJsSiteEnvironment()
    {
        $jsSiteEnvironment = parent::buildJsSiteEnvironment();

        $jsSiteEnvironment['cmsComposers'] = static::getComposers();
        $jsSiteEnvironment['mediaSupportedTypes'] = Media::getSupportedTypes();

        return $jsSiteEnvironment;
    }
}
