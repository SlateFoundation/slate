<?php

namespace Emergence\Site;

use Site;
use League\Flysystem\FilesystemInterface;
use League\Flysystem\Filesystem;
use League\Flysystem\Adapter\Local as LocalAdapter;

class Storage
{
    protected static $filesystems;

    /**
     * Get the root path for all local storage
     *
     * @return string $localRootStoragePath
     */
    public static function getLocalStorageRoot()
    {
        $siteStorageConfig = Site::getConfig('storage');

        if ($siteStorageConfig && !empty($siteStorageConfig['local_root'])) {
            return $siteStorageConfig['local_root'];
        }

        return Site::$rootPath.'/site-data';
    }

    /**
     * Register filesystem for given bucket id
     *
     * @param string $bucketId
     * @param FilesystemInterface $fs
     */
    public static function registerFilesystem($bucketId, FilesystemInterface $fs)
    {
        static::$filesystems[$bucketId] = $fs;
    }

    /**
     * Get registered or create default local storage filesystem for given bucket id
     *
     * @param string $bucketId
     *
     * @return FilesystemInterface
     */
    public static function getFilesystem($bucketId)
    {
        if (empty(static::$filesystems[$bucketId])) {
            $adapter = new LocalAdapter(static::getLocalStorageRoot().'/'.$bucketId);
            static::$filesystems[$bucketId] = new Filesystem($adapter);
        }

        return static::$filesystems[$bucketId];
    }
}
