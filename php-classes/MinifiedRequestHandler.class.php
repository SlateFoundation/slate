<?php

class MinifiedRequestHandler extends RequestHandler
{
    const ERROR_NOT_FOUND = -1;
    const ERROR_TYPE_MISMATCH = -2;

    public static function handleRequest()
    {
        switch (static::shiftPath()) {
            case 'js':
                return static::handleAssetsRequest(array('site-root','js'), 'application/javascript', 'JSMin');
            case 'css':
                return static::handleAssetsRequest(array('site-root','css'), 'text/css', 'CssMin');
            default:
                return static::throwInvalidRequestError();
        }
    }

    public static function handleAssetsRequest($root, $contentType, $minifier)
    {

        // case 1: _sha1 is provided, exists in cache -- no sourceReport needed
        // case 2: _sha1 is provided, doesn't exist in cache, _sha1 matches sourceReport -- sourceReport, compilation, and caching headers needed
        // case 3: _sha1 is provided, doesn't exist in cache, _sha1 doesn't match sourceReport -- sourceReport and compilation needed, no caching headers
        // case 4: no _sha1 provided -- sourceReport and compilation needed, no caching headers

        // get sourceReport or cached code
        if (empty($_GET['_sha1']) || !($code = static::getSourceCode($minifier, $_GET['_sha1']))) {
            try {
                $sourceReport = static::getSourceReport(static::getPath(), $root, $contentType);
            } catch (\Exception $e) {
                if ($e->getCode() != self::ERROR_NOT_FOUND) {
                    throw $e;
                }

                return static::throwNotFoundError('requested content not found');
            }

            $hash = $sourceReport['hash'];
        } else {
            $hash = $_GET['_sha1'];
        }

        header('ETag: '.$hash);


        // if If-None-Match header matches sourceReport or cached code, no response is needed
        if (!empty($_SERVER['HTTP_IF_NONE_MATCH']) && $_SERVER['HTTP_IF_NONE_MATCH'] == $hash) {
            header('HTTP/1.0 304 Not Modified');
            exit();
        }


        // if URL includes correct hash, response can be cached permenantly by the client
        if (!empty($_GET['_sha1']) && (!$sourceReport ||$_GET['_sha1'] == $sourceReport['hash'])) {
            $expires = 60*60*24*365;
            header('Cache-Control: public, max-age='.$expires);
            header('Expires: '.gmdate('D, d M Y H:i:s \G\M\T', time()+$expires));
            header('Pragma: public');
        }


        // compile code if it wasn't retrieved from cache
        if (!$code) {
            $code = static::getSourceCode($minifier, $sourceReport, true);
        }


        // output content
        header('Content-Type: '.$contentType);
        header('Content-Length: '.strlen($code));
        header('Last-Modified: '.gmdate('D, d M Y H:i:s \G\M\T', time()));
        print $code;
        exit();
    }

    public static function getSourceCode($minifier, $cacheHashOrSourceReport, $skipCache = false)
    {
        $cacheHash = is_string($cacheHashOrSourceReport) ? $cacheHashOrSourceReport : $cacheHashOrSourceReport['hash'];
        $cacheKey = "$minifier:$cacheHash";

        if (!$skipCache && ($code = Cache::fetch($cacheKey))) {
            return $code;
        }

        if (is_array($cacheHashOrSourceReport) && is_array($cacheHashOrSourceReport['files'])) {
            $code = '';
            foreach ($cacheHashOrSourceReport['files'] AS $path => $fileData) {
                $code .= $minifier::minify(file_get_contents(SiteFile::getRealPathByID($fileData['ID'])));
            }

            Cache::store($cacheKey, $code);
            return $code;
        }

        return null;
    }

    public static function getSourceReport($paths, $root, $contentType = null)
    {
        $sourceFiles = static::getSourceNodes($paths, $root, $contentType);

        return array(
            'files' => $sourceFiles
            ,'hash' => static::getFilesHash($sourceFiles)
        );
    }

    public static function getSourceNodes($paths, $root, $contentType = null)
    {
        $paths = static::splitMultipath($paths);

        if (is_string($root)) {
            $root = Site::splitPath($root);
        }

        $sourceFiles = array();

        foreach ($paths AS $path) {
            $path = array_merge($root, $path);
            list($filename) = array_slice($path, -1);

            if ($filename == '*') {
                array_pop($path);

                Emergence_FS::cacheTree($path);
                foreach (Emergence_FS::getTreeFiles($path, false, $contentType ? array('Type' => $contentType) : null) AS $path => $fileData) {
                    $sourceFiles[$path] = $fileData;
                }
            } else {
                $node = Site::resolvePath($path);
                if (!$node || !is_a($node, 'SiteFile')) {
                    throw new Exception('Source file "'.implode('/', $path).'" does not exist', self::ERROR_NOT_FOUND);
                }

                if ($node->Type != $contentType) {
                    throw new Exception('Source file "'.implode('/', $path).'" does not match requested content type "'.$contentType.'"', self::ERROR_TYPE_MISMATCH);
                }

                $sourceFiles[join('/', $path)] = array(
                    'ID' => $node->ID
                    ,'SHA1' => $node->SHA1
                );
            }
        }

        return $sourceFiles;
    }

    public static function splitMultipath($paths)
    {
        if (is_array($paths)) {
            $paths = implode('/', $paths);
        }

        return array_map(function($path) {
            return array_filter(explode('/', $path));
        }, preg_split('/(\+|%2B|%20|\s+)/', $paths));
    }

    public static function getFilesHash($files)
    {
        $hashStr = '';

        foreach ($files AS $path => $fileData) {
            $hashStr .= "$path\t$fileData[SHA1]\n";
        }

        return SHA1($hashStr);
    }
}