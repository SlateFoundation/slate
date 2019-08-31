<?php

namespace Jarvus\Sencha;

use Site;
use Emergence_FS;

class Framework
{
    public static $versions = [
        'ext' => [
            // default config for all framework versions
            '*'            => [
                'class' => Framework\Ext::class
            ],

            // version mappings
            '4'            => '4.2',
            '4.2'       => '4.2.3',
            '4.2.1'     => '4.2.1.883',
            '4.2.2'     => '4.2.2.1144',
            '4.2.3'     => '4.2.3.1477',
            '5'            => '5.1',
            '5.0'       => '5.0.1',
            '5.0.0'     => '5.0.0.970',
            '5.0.1'     => '5.0.1.1255',
            '5.1'       => '5.1.1',
            '5.1.0'     => '5.1.0.107',
            '5.1.1'     => '5.1.1.451'

            // version-specific config
//			'5.1.1.451' => [
//				'class' => Framework\Ext511451::class
//			]
        ],
        'touch' => [
            // default config for all framework versions
            '*'            => [
                'class' => Framework\Touch::class
            ],

            // version mappings
            '2'            => '2.4',
            '2.2'        => '2.2.1',
            '2.2.1'     => '2.2.1.2',
            '2.3'        => '2.3.1',
            '2.3.1'    => '2.3.1.410',
            '2.4'        => '2.4.1',
            '2.4.0'    => '2.4.0.487',
            '2.4.1'    => '2.4.1.527'
        ]
    ];

    public static $inheritFrameworks = false;

    public static $sharedCacheDirectory = '/tmp/sencha-frameworks';

    public static $extractPaths = [
        '*' => [
            'exclude' => ['build/*', 'welcome/*', 'examples/*', 'test/*']
        ],
        'examples/ux/*',
        'build/*' => [
            'exclude' => ['build/examples/*', 'build/packages/*', 'build/welcome/*']
        ]
    ];


    protected $name;
    protected $version;
    protected $config;

    protected $physicalPath;
    protected $virtualPath;


    // factories
    public static function get($name, $version, $config = [])
    {
        $version = static::getCanonicalVersion($name, $version);
        $config = array_merge(static::getDefaultConfig($name, $version), $config);

        if (empty($config['class'])) {
            $config['class'] = get_called_class();
        }

        return new $config['class']($name, $version, $config);
    }


    // magic methods and property getters
    public function __construct($name, $version, $config = [])
    {
        $this->name = $name;
        $this->version = $version;

        $this->config = $this->parseConfig($config);

        $this->physicalPath = $this->getConfig('physicalPath') ?: null;
        $this->virtualPath = $this->getConfig('virtualPath') ?: null;
    }

    public function __toString()
    {
        return $this->name.'-'.$this->version;
    }

    public function getName()
    {
        return $this->name;
    }

    public function getVersion()
    {
        return $this->version;
    }

    public function getConfig($key = null)
    {
        return $key ? $this->config[$key] : $this->config;
    }


    // public instance methods
    /**
     * Normalizes a user-supplied config array by applying conversions and defaults.
     */
    public function parseConfig(array $config)
    {
        return $config;
    }

    public function getDownloadUrl()
    {
        return $this->getConfig('downloadUrl');
    }

    /**
     * Returns a path to the framework in the VFS, ready for build use
     */
    public function getVirtualPath($autoLoad = true)
    {
        if ($this->virtualPath) {
            return $this->virtualPath;
        }

        // check if framework exists in VFS
        $virtualPath = "sencha-workspace/$this";

        if (Site::resolvePath("$virtualPath/version.properties", static::$inheritFrameworks)) {
            if (static::$inheritFrameworks) {
                Emergence_FS::cacheTree($virtualPath);
            }

            return $this->virtualPath = $virtualPath;
        }

        // framework doesn't exist in VFS, try to download and import it
        if (!$autoLoad) {
            return null;
        }

        if (!$physicalPath = $this->getPhysicalPath()) {
            throw new \Exception('Failed to obtain physical path to import framework');
        }

        Emergence_FS::importTree($physicalPath, $virtualPath);

        return $this->virtualPath = $virtualPath;
    }

    /**
     * Returns a path to the framework on disk, ready for build use
     */
    public function getPhysicalPath($autoLoad = true)
    {
        if ($this->physicalPath) {
            return $this->physicalPath;
        }

        // try to get VFS copy first, export to site-data instead of cacheDirectory
        if ($virtualPath = $this->getVirtualPath(false)) {
            $physicalPath = Site::$rootPath."/site-data/sencha-frameworks/$this";

            if (!is_dir($physicalPath)) {
                if (!$autoLoad) {
                    return null;
                }

                Emergence_FS::exportTree($virtualPath, $physicalPath);
            }

            return $this->physicalPath = $physicalPath;
        }

        // check if already extracted to cache directory
        $physicalPath = static::$sharedCacheDirectory."/$this";

        if (is_dir($physicalPath)) {
            return $this->physicalPath = $physicalPath;
        }

        if (!$autoLoad) {
            return null;
        }

        // prepare to download to cache directory
        $archivePath = "$physicalPath.zip";

        // delete if it exists already as it may be a failed download/extract
        if (file_exists($archivePath)) {
            unlink($archivePath);
        }

        // download from Sencha CDN
        if (!$this->downloadArchive($archivePath)) {
            throw new \Exception('Failed to download framework');
        }

        // extract to cache directory
        if (!$this->extractArchive($archivePath, $physicalPath)) {
            unlink($archivePath);
            throw new \Exception('Failed to extract framework');
        }

        // clean up download
        unlink($archivePath);

        return $this->physicalPath = $physicalPath;
    }

    public function downloadArchive($archivePath)
    {
        $downloadUrl = $this->getDownloadUrl();

        if (!$downloadUrl) {
            return false;
        }

        $archiveDir = dirname($archivePath);

        if (!is_dir($archiveDir)) {
            mkdir($archiveDir, 0777, true);
        }

        exec(
            sprintf('wget %s -O %s', escapeshellarg($downloadUrl), escapeshellarg($archivePath)),
            $downloadOutput,
            $downloadStatus
        );

        if ($downloadStatus != 0 || !file_exists($archivePath)) {
            @unlink($archivePath);
            throw new \Exception("Failed to download framework from $downloadUrl, wget status=$downloadStatus");
        }

        return true;
    }

    public function extractArchive($archivePath, $outputPath)
    {
        $tmpPath = Emergence_FS::getTmpDir();

        // determine archive's root directory
        $archiveRootDirectory = trim(exec('unzip -l '.escapeshellarg($archivePath).' -x \'*/**\' | grep \'/\' | awk \'{print $4}\''), " \t\n\r/");

        if (!$archiveRootDirectory) {
            throw new \Exception('Failed to determine roor directory for framework archive');
        }

        // extract minimum files
        $extractPaths = $this->getExtractPaths();

        foreach ($extractPaths AS $extractPath => $extractConfig) {
            if (is_string($extractConfig)) {
                $extractPath = $extractConfig;
            }

            if (!is_array($extractConfig)) {
                $extractConfig = [];
            }

            $extractPath = $archiveRootDirectory.'/'.$extractPath;

            $unzipCommand = 'unzip '.escapeshellarg($archivePath).' '.escapeshellarg($extractPath);

            if (!empty($extractConfig['exclude'])) {
                $unzipCommand .= ' '.
                    implode(
                        ' ',
                        array_map(
                            function($excludePath) use ($archiveRootDirectory) {
                                return '-x '.escapeshellarg($archiveRootDirectory.'/'.$excludePath);
                            },
                            is_string($extractConfig['exclude']) ? [$extractConfig['exclude']] : $extractConfig['exclude']
                        )
                    );
            }

            $unzipCommand .= ' -d '.escapeshellarg($tmpPath);

            exec($unzipCommand);
        }

        rename($tmpPath.'/'.$archiveRootDirectory, $outputPath);
        rmdir($tmpPath);
        exec('chmod -R =Xr '.escapeshellarg($outputPath));

        return true;
    }

    public function writeToDisk($path)
    {
        exec('cp -R '.escapeshellarg($this->getPhysicalPath()).' '.escapeshellarg($path));
        return true;
    }

    /**
     * Returns a list of paths within the framework distribution that
     * must be extracted for builds
     */
    public function getExtractPaths()
    {
        return static::$extractPaths;
    }


    // static utility methods
    public static function getCanonicalVersion($name, $version)
    {
        $versions = static::$versions[$name];

        while ($versions && is_string($versions[$version])) {
            $version = $versions[$version];
        }

        return $version;
    }

    public static function getDefaultConfig($name, $version)
    {
        $config = [];

        if (isset(static::$versions[$name])) {
            if (isset(static::$versions[$name]['*'])) {
                $config = array_merge($config, static::$versions[$name]['*']);
            }

            if (isset(static::$versions[$name][$version])) {
                $config = array_merge($config, static::$versions[$name][$version]);
            }
        }

        return $config;
    }
}