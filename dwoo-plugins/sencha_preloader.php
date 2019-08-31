<?php

function Dwoo_Plugin_sencha_preloader(Dwoo_Core $dwoo, $classes = "app", $App = null)
{
    if (!$App) {
        $App = $dwoo->data['App'];
    }

    $appName = $App->getName();
    $appPath = "sencha-workspace/$appName";

    // include classpath files
    $classPaths = explode(',', $App->getBuildCfg('app.classpath'));

    $srcCollections = array();
    foreach ($classPaths AS $classPath) {
        if (substr($classPath, 0, 11) == '${app.dir}/') {
            $classPath = $appPath.substr($classPath, 10);
        } else {
            continue;
        }

        try {
            $tree = Emergence_FS::getTree($classPath);
            $srcCollections = array_merge($srcCollections, array_keys($tree));
        } catch (Exception $e) {
            continue;
        }
    }

    // include package files
    $requiredPackages = $App->getAppCfg('requires');

    if (!is_array($requiredPackages)) {
        $requiredPackages = array();
    }

    if (($themeName = $App->getBuildCfg('app.theme')) && !in_array($themeName, $requiredPackages)) {
        $requiredPackages[] = $themeName;
    }

    foreach ($requiredPackages AS $packageName) {
        $packagePath = "sencha-workspace/packages/$packageName";
        foreach (array("$packagePath/src", "$packagePath/overrides") AS $classPath) {
            try {
                $tree = Emergence_FS::getTree($classPath);
                $srcCollections = array_merge($srcCollections, array_keys($tree));
            } catch (Exception $e) {
                continue;
            }
        }
    }

#	Benchmark::startLive();
#	Benchmark::mark("sencha_preload");
#	Benchmark::mark("getting files from ".count($srcCollections)." collections");

    // get files
    if (count($srcCollections)) {
        $sources = DB::allRecords(
            'SELECT'
                .' f2.SHA1'
                .',CONCAT('
                    .'('
                        .'SELECT GROUP_CONCAT(parent.Handle ORDER BY parent.PosLeft SEPARATOR "/")'
                        .' FROM `%2$s` AS node, `%2$s` AS parent'
                        .' WHERE node.PosLeft BETWEEN parent.PosLeft AND parent.PosRight AND node.ID = f2.CollectionID'
                    .')'
                    .',"/"'
                    .',f2.Handle'
                .') AS Path'
                .' FROM ('
                    .' SELECT MAX(f1.ID) AS ID'
                    .' FROM `%1$s` f1'
                    .' WHERE CollectionID IN (%3$s)'
                    .' GROUP BY f1.CollectionID, f1.Handle'
                .') AS lastestFiles'
                .' LEFT JOIN `%1$s` f2 USING (ID)'
                .' WHERE f2.Status = "Normal" AND f2.Type = "application/javascript"'
            ,array(
                SiteFile::$tableName
                ,SiteCollection::$tableName
                ,join(',', $srcCollections)
            )
        );
    } else {
        $sources = array();
    }

    // compile keyed manifest with localized paths
    $manifest = array();
    foreach ($sources AS $source) {
        if (strpos($source['Path'], "$appPath/") === 0) {
            $manifest[substr($source['Path'], strlen($appPath) + 1)] = $source['SHA1'];
        } elseif (strpos($source['Path'], 'sencha-workspace/packages/') === 0) {
            $manifest['../'.substr($source['Path'], 17)] = $source['SHA1'];
        }
    }

#	$srcMasterHash = sha1(join(PHP_EOL, $srcHashes));
#
#	Benchmark::mark("found ".count($srcHashes)." files");
#
#	// try to get src from cache
#	$cacheKey = "app-cache/$srcMasterHash";
#
#	if(!Cache::exists($cacheKey)) {
#		$src = '';
#
#		foreach($srcHashes AS $fileId => $sha1) {
#			$src .= JSMin::minify(file_get_contents(SiteFile::getRealPathByID($fileId)));
#		}
#
#		Cache::store($cacheKey, $src);
#	}
#
#	Benchmark::mark("compiled: ".strlen($src)." bytes");
#
    //getRealPathByID
    return
        '<script type="text/javascript">(function(){'
            .'var srcManifest = '.json_encode($manifest)
                .',origLoadScript = Ext.Loader.loadScript'
                .',origLoadScriptFile = Ext.Loader.loadScriptFile'
                .',dcParam = Ext.Loader.getConfig("disableCachingParam")'
                .',now = Ext.Date.now();'

            .'function _versionScriptUrl(url) {'
                .'if(url in srcManifest) {'
                    .'url += "?_sha1=" + srcManifest[url];'
                .'} else {'
                    .'url += "?" + dcParam + "=" + now;'
                .'}'
                .'return url;'
            .'}'

            .'Ext.Loader.setConfig("disableCaching", false);'

            .'Ext.Loader.loadScript = function(options) {'
                .'if (typeof options == "string") {'
                    .'options = _versionScriptUrl(options);'
                .'} else {'
                    .'options.url = _versionScriptUrl(options.url);'
                .'}'
                .'origLoadScript.call(Ext.Loader, options);'
            .'};'

            .'Ext.Loader.loadScriptFile = function(url, onLoad, onError, scope, synchronous) {'
                .'origLoadScriptFile.call(Ext.Loader, _versionScriptUrl(url), onLoad, onError, scope, synchronous);'
            .'};'
        .'})()</script>';
}

