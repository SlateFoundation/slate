<?php

function Dwoo_Plugin_sencha_bootstrap(Dwoo_Core $dwoo, $App = null, $classPaths = [], $packages = [], $patchLoader = true, $framework = 'ext', $frameworkVersion = null, $packageRequirers = null)
{
    // retrieve app if available
    if (!$App) {
        $App = $dwoo->data['App'];
    }

    // load workspace classpaths
    $classPaths = array_merge($classPaths, explode(',', Sencha::getWorkspaceCfg('workspace.classpath')));

    // if app provided, load classpaths and packages
    if ($App) {
        $framework = $App->getFramework();
        $frameworkVersion = $App->getFrameworkVersion();
        $appPath = 'sencha-workspace/'.$App->getName();

        // recursively merge app's required packages and their required packages into packages list
        $packages = array_merge($packages, $App->getRequiredPackages(false)); // false to skip crawling decendents, we'll do it here later

        // add theme to packages list
        if ($themeName = $App->getBuildCfg('app.theme')) {
            $packages[] = $themeName;
        }

        // include classpath files
        $classPaths = array_merge($classPaths, explode(',', $App->getBuildCfg('app.classpath')));

        // include override files
        if ($overridesPath = $App->getBuildCfg('app.overrides')) {
            $classPaths = array_merge($classPaths, explode(',', $overridesPath));
        }
    }

    // pull package requirements from source files
    if (!empty($packageRequirers)) {
        if (is_string($packageRequirers)) {
            $packageRequirers = [$packageRequirers];
        }

        foreach ($packageRequirers AS $packageRequirer) {
            if ($sourceNode = Site::resolvePath($packageRequirer)) {
                $packages = array_merge($packages, Sencha::getRequiredPackagesForSourceFile($sourceNode->RealPath));
            }
        }
    }

    // apply default framework version and normalize
    if (!$frameworkVersion) {
        $frameworkVersion = Sencha::$frameworks[$framework]['defaultVersion'];
    }

    $frameworkVersion = Sencha::normalizeFrameworkVersion($framework, $frameworkVersion);
    $frameworkPath = "sencha-workspace/$framework-$frameworkVersion";

    // initialize output state
    $manifest = [];
    $autoLoadPaths = [];

    // set framework path if patching loader
    if ($patchLoader) {
        $manifest['Ext'] = "/app/$framework-$frameworkVersion/src";
    }

    // add paths for packages
    $packages = array_unique(Sencha::crawlRequiredPackages(array_unique($packages), $framework, $frameworkVersion));

    foreach ($packages AS $packageName) {
        // check workspace and framework package dirs
        $packagePath = "sencha-workspace/packages/$packageName";

        if (!Site::resolvePath($packagePath)) {
            $packagePath = "$frameworkPath/packages/$packageName";

            if (!Site::resolvePath($packagePath)) {
                throw new Exception("Source for package $packageName not found in workspace or framework");
            }
        }

        array_push($classPaths, "$packagePath/src", "$packagePath/overrides");
    }

    // include classpaths from packages
    $classPaths = array_merge($classPaths, Sencha::aggregateClassPathsForPackages($packages));

    // filter classpaths
    $classPaths = array_unique(array_filter($classPaths));

    // build list of all source trees, resolving CMD variables and children
    $sources = [];
    foreach ($classPaths AS $classPath) {
        if (strpos($classPath, '${app.dir}/') === 0) {
            $classPath = $appPath.substr($classPath, 10);
        } elseif (strpos($classPath, '${ext.dir}/') === 0) {
            $classPath = $frameworkPath.substr($classPath, 10);
        } elseif (strpos($classPath, '${touch.dir}/') === 0) {
            $classPath = $frameworkPath.substr($classPath, 12);
        }

        Emergence_FS::cacheTree($classPath);
        $sources = array_merge($sources, Emergence_FS::getTreeFiles($classPath, false, ['Type' => 'application/javascript']));
    }

    // skip patching loader if manifest will be empty
    if (empty($sources)) {
        return '';
    }

    // process all source files and build manifest and list of classes to automatically load
    foreach ($sources AS $path => &$source) {
        $autoLoad = false;
        $addToManifest = true;

        // rewrite path to canonican external URL
        if ($appPath && strpos($path, "$appPath/") === 0) {
            $webPath = '/app/'.substr($path, 17);

            // app overrides should automatically be loaded
            if (substr($path, strlen($appPath), 11)== '/overrides/') {
                $autoLoad = true;
                $addToManifest = false;
            }
        } elseif (strpos($path, 'sencha-workspace/packages/') === 0) {
            $webPath = '/app/'.substr($path, 17);

            // package overrides should automatically be loaded
            if (substr($path, strpos($path, '/', 26), 11) == '/overrides/') {
                $autoLoad = true;
                $addToManifest = false;
            }
        } elseif (strpos($path, $frameworkPath) === 0) {
            $webPath = "/app/$framework-$frameworkVersion/".substr($path, strlen($frameworkPath) + 1);

            // package overrides should automatically be loaded
            if (substr($path, strpos($path, '/', strlen($frameworkPath) + 10), 11) == '/overrides/') {
                $autoLoad = true;
                $addToManifest = false;
            }
        } elseif (strpos($path, 'sencha-workspace/pages/') === 0) {
            $webPath = '/app/'.substr($path, 17);
        } elseif (strpos($path, $frameworkPath) === 0) {
            $webPath = '/app/'.substr($path, 17);
        } else {
            // this class was not in a recognized externally loadable collection
            continue;
        }

        // discover class name
        $sourceCacheKey = "sencha-class-name/$source[SHA1]";

        if (!$source['Class'] = Cache::fetch($sourceCacheKey)) {
            $sourceNode = Site::resolvePath($path);
            $sourceReadHandle = $sourceNode->get();

            while (($line = fgets($sourceReadHandle, 4096)) !== false) {
                if (preg_match('/^\s*(Ext\.define\(\s*([\'"])([^\2]+)\2|\/\/\s*@define[ \t]+(\S+))/i', $line, $matches)) {
                    $source['Class'] = empty($matches[4]) ? $matches[3] : $matches[4];
                    break;
                }
            }

            fclose($sourceReadHandle);

            // cache class name
            Cache::store($sourceCacheKey, $source['Class']);
        }

        // skip if class name could not be determined
        if (!$source['Class']) {
            continue;
        }

        // apply fingerprint signature to path
        $webPath = "$webPath?_sha1=$source[SHA1]";

        // map class name to path
        if ($addToManifest) {
            $manifest[$source['Class']] = $webPath;
        }

        // add path to autoLoad list
        if ($autoLoad) {
            $autoLoadPaths[] = $webPath;
        }
    }


    // build loader overrides
    $loaderPatch = '';

    if ($patchLoader) {
        $loaderPatch .= 'Ext.Loader.setConfig("disableCaching", false);';

        $loaderPatch .=
            'function _versionScriptUrl(url) {'
                .'if (url[0] != "/") {'
                    .'url = window.location.pathname + url;'
                    .'while (url.match(/\/\.\.\//)) url = url.replace(/\/[^\/]+\/\.\./g, "");'
                .'}'

                .'if(!url.match(/\?_sha1=/)) {'
                    .'console.warn("Fingerprinted URL not found for %o, it will be loaded with a cache-buster", url);'
                    .'url += "?" + dcParam + "=" + now;'
                .'}'

                .'return url;'
            .'}';

        $loaderPatch .=
            'function _overrideMethod(cls, method, override) {'
                .'var parent = cls[method] || Ext.emptyFn;'
                .'cls[method] = function() {'
                    .'var me = this;'
                    .'callArgs = Array.prototype.slice.call(arguments, 0);'
                    .'callArgs.unshift(function() {'
                        .'parent.apply(me, arguments);'
                    .'});'
                    .'return override.apply(this, callArgs);'
                .'};'
            .'}';

#        if (Sencha::isVersionNewer('5', $frameworkVersion)) {
        if ($framework == 'ext') {
            $loaderPatch .=
                '_overrideMethod(Ext.Loader, "loadScript", function(parent, options) {'
                    .'if (typeof options == "string") {'
                        .'options = _versionScriptUrl(options);'
                    .'} else {'
                        .'options.url = _versionScriptUrl(options.url);'
                    .'}'
                    .'return parent(options);'
                .'});';
        } else {
            $loaderPatch .=
                '_overrideMethod(Ext.Loader, "loadScriptFile", function(parent, url, onLoad, onError, scope, synchronous) {'
                    .'return parent(_versionScriptUrl(url), onLoad, onError, scope, synchronous);'
                .'});';
        }
    }

    // output loader patch and manifest
    return
        '<script type="text/javascript">(function(){'
            .'var dcParam = Ext.Loader.getConfig("disableCachingParam")'
                .',now = Ext.Date.now();'

            .$loaderPatch

            .'Ext.Loader.addClassPathMappings('.json_encode($manifest).');'
        .'})()</script>'

        .(
            count($autoLoadPaths) ?
                implode(
                    '',
                    array_map(
                        function($url) {
                            return '<script type="text/javascript" src="'.$url.'"></script>';
                        },
                        $autoLoadPaths
                    )
                )
            :
                ''
        );
}