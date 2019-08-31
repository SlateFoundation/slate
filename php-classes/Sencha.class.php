<?php

class Sencha
{
    public static $frameworks = array(
        'ext' => array(
            'defaultVersion' => '5.0.1.1255'
            ,'mappedVersions' => array(
                '4.2.1'     => '4.2.1.883'
                ,'4.2.2'    => '4.2.2.1144'
                ,'4.2.3'    => '4.2.3.1477'
                ,'4.2'      => '4.2.3.1477'
                ,'5.0.0'    => '5.0.0.970'
                ,'5.0.1'    => '5.0.1.1255'
                ,'5.0'      => '5.0.1.1255'
            )
        )
        ,'touch' => array(
            'defaultVersion' => '2.4.0'
            ,'mappedVersions' => array(
                '2.2.1' => '2.2.1.2'
                ,'2.3.1.410' => '2.3.1'
                ,'2.4.0.487' => '2.4.0'
                ,'2.4.1.527' => '2.4.1'
            )
        )
    );

    public static $defaultCmdVersion = '5.1.2.52';

    public static $cmdPath = '/usr/local/bin/Sencha/Cmd';
    public static $binPaths = array('/bin','/usr/bin','/usr/local/bin');

    protected static $_workspaceCfg;
    protected static $_packageDependencies = array();

    public static function buildCmd()
    {
        $args = func_get_args();
        if (!$cmdVersion = array_shift($args)) {
            $cmdVersion = static::$defaultCmdVersion;
        }

        $cmd = sprintf('SENCHA_CMD_3_0_0="%1$s" PATH="%2$s" %1$s/sencha', static::$cmdPath.'/'.$cmdVersion, implode(':', static::$binPaths));

        foreach ($args AS $arg) {
            if (is_string($arg)) {
                $cmd .= ' '.$arg;
            } elseif (is_array($arg)) {
                $cmd .= ' '.implode(' ', $arg);
            }
        }

        return $cmd;
    }

    public static function loadProperties($file)
    {
        $properties = array();
        $fp = fopen($file, 'r');

        while ($line = fgetss($fp)) {
            // clean out space and comments
            $line = preg_replace('/\s*([^#\n\r]*)\s*(#.*)?/', '$1', $line);

            if ($line) {
                list($key, $value) = explode('=', $line, 2);
                $properties[$key] = $value;
            }
        }

        fclose($fp);

        return $properties;
    }

    public static function isVersionNewer($oldVersion, $newVersion)
    {
        $oldVersion = explode('.', $oldVersion);
        $newVersion = explode('.', $newVersion);

        while (count($oldVersion) || count($newVersion)) {
            $oldVersion[0] = (integer)$oldVersion[0];
            $newVersion[0] = (integer)$newVersion[0];

            if ($newVersion[0] == $oldVersion[0]) {
                array_shift($oldVersion);
                array_shift($newVersion);
                continue;
            } elseif ($newVersion[0] > $oldVersion[0]) {
                return true;
            } else {
                return false;
            }
        }

        return false;
    }

    public static function normalizeFrameworkVersion($framework, $version)
    {
        $mappedVersions = static::$frameworks[$framework]['mappedVersions'];
        return $mappedVersions && array_key_exists($version, $mappedVersions) ? $mappedVersions[$version] : $version;
    }

    public static function getVersionedFrameworkPath($framework, $filePath, $version = null)
    {
        if (!$version) {
            $version = Sencha::$frameworks[$framework]['defaultVersion'];
        }

        $version = Sencha::normalizeFrameworkVersion($framework, $version);

        if (is_string($filePath)) {
            $filePath = Site::splitPath($filePath);
        }

        $assetPath = Sencha_RequestHandler::$externalRoot.'/'.$framework.'-'.$version.'/'.implode('/', $filePath);

        array_unshift($filePath, 'sencha-workspace', "$framework-$version");
        $Asset = Site::resolvePath($filePath);

        if ($Asset) {
            return $assetPath.'?_sha1='.$Asset->SHA1;
        } else {
            return $assetPath;
        }
    }

    public static function crawlRequiredPackages($packages, $framework = null, $frameworkVersion = null)
    {
        // cache results
        if (is_string($packages) && $packages) {
            $packages = array($packages);
        } elseif (!is_array($packages)) {
            return array();
        }

        foreach ($packages AS $package) {
            $cacheKey = "$package@$framework-$frameworkVersion";

            // check cache
            if (isset(static::$_packageDependencies[$cacheKey])) {
                $packages = array_merge($packages, static::$_packageDependencies[$cacheKey]);
                continue;
            }

            $packagePackages = array();
            $packageConfigNode = Site::resolvePath(array('sencha-workspace', 'packages', $package, 'package.json'));

            // check framework packages directory
            if (!$packageConfigNode && $framework && $frameworkVersion) {
                $packageConfigNode = Site::resolvePath(array('sencha-workspace', "$framework-$frameworkVersion", 'packages', $package, 'package.json'));
            }

            if (!$packageConfigNode) {
                throw new Exception("Could not find package.json for Sencha package $package");
            }

            $packageConfig = json_decode(file_get_contents($packageConfigNode->RealPath), true);

            if (is_array($packageConfig)) {
                if (!empty($packageConfig['requires'])) {
                    $packagePackages = array_merge($packagePackages, static::crawlRequiredPackages($packageConfig['requires'], $framework, $frameworkVersion));
                }

                if (!empty($packageConfig['extend'])) {
                    $packagePackages = array_merge($packagePackages, static::crawlRequiredPackages($packageConfig['extend'], $framework, $frameworkVersion));
                }
            }

            $packages = array_merge($packages, $packagePackages);
            static::$_packageDependencies[$cacheKey] = $packagePackages;
        }

        return $packages;
    }

    public static function aggregateClassPathsForPackages($packages, $skipPackageRelative = true)
    {
        if (!is_array($packages)) {
            return array();
        }

        $classPaths = array();

        foreach ($packages AS $packageName) {
            $packageBuildConfigNode = Site::resolvePath("sencha-workspace/packages/$packageName/.sencha/package/sencha.cfg");
            if ($packageBuildConfigNode) {
                $packageBuildConfig = Sencha::loadProperties($packageBuildConfigNode->RealPath);
                foreach (explode(',', $packageBuildConfig['package.classpath']) AS $classPath) {
                    if (!$skipPackageRelative || strpos($classPath, '${package.dir}') !== 0) {
                        $classPaths[] = $classPath;
                    }
                }
            }
        }

        return array_unique($classPaths);
    }

    public static function getRequiredPackagesForSourceFile($sourcePath)
    {
        return static::getRequiredPackagesForSourceCode(file_get_contents($sourcePath));
    }

    public static function getRequiredPackagesForSourceCode($code)
    {
        if (preg_match_all('|//\s*@require-package\s*(\S+)|i', $code, $matches)) {
            return $matches[1];
        } else {
            return array();
        }
    }

    public static function getWorkspaceCfg($key = null)
    {
        if (!static::$_workspaceCfg) {
            // get from filesystem
            $configPath = array('sencha-workspace', '.sencha', 'workspace', 'sencha.cfg');

            if ($configNode = Site::resolvePath($configPath, true, false)) {
                static::$_workspaceCfg = Sencha::loadProperties($configNode->RealPath);
            } else {
                static::$_workspaceCfg = array();
            }
        }

        return $key ? static::$_workspaceCfg[$key] : static::$_workspaceCfg;
    }

    public static function cleanJson($json)
    {
        $json = preg_replace('#(/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/)|([\s\t]//.*)|(^//.*)#', '', $json); // comment stripper from http://php.net/manual/en/function.json-decode.php#112735
        $json = preg_replace('#([^\\\\])\\\\\\.#', '$1\\\\\\.', $json); // replace sencha-included "\." with "\\."

        return $json;
    }
}