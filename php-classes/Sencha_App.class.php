<?php

class Sencha_App
{
    protected $_name;
    protected $_buildCfg;

    public function __construct($name)
    {
        $this->_name = $name;
    }

    public static function getByName($name)
    {
        return new static($name);
    }

    public function getName()
    {
        return $this->_name;
    }

    public function getFramework()
    {
        return $this->getBuildCfg('app.framework');
    }

    public function getFrameworkVersion()
    {
        return Sencha::normalizeFrameworkVersion($this->getFramework(), $this->getBuildCfg('app.framework.version'));
    }

    public function getAppId()
    {
        return $this->getAppCfg('id');
    }

    public function getBuildCfg($key = null)
    {
        if ($this->_buildCfg) {
            return $key ? $this->_buildCfg[$key] : $this->_buildCfg;
        }

        // try to get from shared cache - this seems annoying and unecessary
#		$cacheKey = "app/$this->_name/config";
#
#		if($this->_buildCfg = Cache::fetch($cacheKey))
#		{
#			return $key ? $this->_buildCfg[$key] : $this->_buildCfg;
#		}

        // get from filesystem
        $configPath = array('sencha-workspace', $this->_name, '.sencha', 'app', 'sencha.cfg');

        if ($configNode = Site::resolvePath($configPath, true, false)) {
            $this->_buildCfg = Sencha::loadProperties($configNode->RealPath);
        } else {
            $this->_buildCfg = array();
        }

        if ($jsonCfg = $this->getAppCfg()) {
            Emergence\Util\Data::collapseTreeToDottedKeys($jsonCfg, $this->_buildCfg, 'app');
        }

        // store in cache
#		Cache::store($cacheKey, $this->_buildCfg);

        return $key ? $this->_buildCfg[$key] : $this->_buildCfg;
    }

    public function getAppCfg($key = null)
    {
        if ($this->_appCfg) {
            return $key ? $this->_appCfg[$key] : $this->_appCfg;
        }

        // get from filesystem
        $configPath = array('sencha-workspace', $this->_name, 'app.json');

        if (!$configNode = Site::resolvePath($configPath, true, false)) {
            return null;
        }

        $json = file_get_contents($configNode->RealPath);

        // patch invalid json
        $json = Sencha::cleanJson($json);

        $this->_appCfg = json_decode($json, true);

        return $key ? $this->_appCfg[$key] : $this->_appCfg;
    }

    public function getAsset($filePath, $useCache = true)
    {
        if (is_string($filePath)) {
            $filePath = Site::splitPath($filePath);
        }

        $appName = $this->getName();
        $framework = $this->getFramework();
        $frameworkVersion = $this->getFrameworkVersion();

        if ($filePath[0] == 'sdk' || $filePath[0] == $framework) {
            array_shift($filePath);
            array_unshift($filePath, 'sencha-workspace', "$framework-$frameworkVersion");
        } elseif ($filePath[0] == 'packages') {
            array_shift($filePath);
            array_unshift($filePath, 'sencha-workspace', 'packages');
        } elseif ($filePath[0] == 'microloaders') {
            array_shift($filePath);
            array_unshift($filePath, 'sencha-workspace', 'microloaders', $framework);
        } elseif ($filePath[0] == 'resources') {
            array_unshift($filePath, 'sencha-build', $appName, 'production');
        } elseif ($filePath[0] == 'build') {
            if ($filePath[1] == 'sdk' || $filePath[1] == $framework) {
                array_shift($filePath);
                array_shift($filePath);
                array_unshift($filePath, 'sencha-workspace', "$framework-$frameworkVersion");
            } else {
                array_shift($filePath);
                array_unshift($filePath, 'sencha-build', $appName);
            }
        } else {
            array_unshift($filePath, 'sencha-workspace', $appName);
        }

        return Site::resolvePath($filePath, true, $useCache);
    }

    public function getVersionedPath($filePath, $useCache = false)
    {
        if (is_string($filePath)) {
            $filePath = Site::splitPath($filePath);
        }

        $Asset = $this->getAsset($filePath);
        $assetPath = Sencha_RequestHandler::$externalRoot.'/'.$this->getName().'/'.implode('/', $filePath);

        if ($Asset) {
            return $assetPath.'?_sha1='.$Asset->SHA1;
        } else {
            return $assetPath;
        }
    }

    public function getMicroloader($mode = 'production', $debug = null)
    {
        $debug = $debug === null ? !empty($_GET['jsdebug']) : $debug;
        $cacheKey = "app/$this->_name/microloader/$mode";

        if ($debug || !($code = Cache::fetch($cacheKey))) {
            $node = static::getAsset("microloaders/$mode.js");
            $code = $node ? file_get_contents($node->RealPath) : '';

            if (!$debug) {
                $code = JSMin::minify($code);
                Cache::store($cacheKey, $code);
            }
        }

        return $code;
    }

    public function getRequiredPackages($deep = true)
    {
        $packages = $this->getAppCfg('requires') ?: array();

        if ($themeName = $this->getBuildCfg('app.theme')) {
            $packages[] = $themeName;
        }

        if ($deep) {
            $packages = array_unique(Sencha::crawlRequiredPackages($packages, $this->getFramework(), $this->getFrameworkVersion()));
        }

        return $packages;
    }
}
