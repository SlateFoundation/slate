<?php

namespace Emergence\SiteAdmin;

use Site;

use Emergence\Site\Storage;


class LogsRequestHandler extends \RequestHandler
{
    public static $files = [
        'site-data/site.log' => [
            'format' => 'php-app',
            'title' => 'PHP Application Log',
            'allowEdit' => true
        ],
        'logs/general.log' => [
            'format' => 'php-app',
            'title' => 'PHP Application General Log',
            'allowEdit' => true
        ],
        'logs/crash.log' => [
            'format' => 'php-app',
            'title' => 'PHP Application Crash Log',
            'allowEdit' => true
        ],
        'logs/access.log' => [
            'format' => 'nginx-access',
            'title' => 'nginx access log'
        ],
        'logs/error.log' => [
            'format' => 'nginx-error',
            'title' => 'nginx error log'
        ]
    ];

    public static function handleRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Developer');

        $path = array_filter(static::getPath());

        if (count($path)) {
            $path = implode('/', $path);

            if (empty(static::$files[$path])) {
                return static::throwNotFoundError('log not found');
            }

            return static::handleLogRequest($path);
        }

        return static::respond('logs', [
            'files' => static::getFiles()
        ]);
    }

    public static function handleLogRequest($path)
    {
        $GLOBALS['Session']->requireAccountLevel('Developer');

        if (!$file = static::getFiles()[$path]) {
            throw new \Exception('no definition for log: ' . $path);
        }

        if (!empty($_GET['download']) && $_GET['download'] == 'raw') {
            header('Content-Length: ' . $file['size']);
            header('Content-Type: text/plain; charset=utf-8');
            header('Content-Disposition: attachment; filename="' . addslashes(basename($path)) . '"');
            readfile($file['realPath']);
            exit();
        }

        $file['lines'] = !empty($_GET['lines']) && ctype_digit($_GET['lines']) ? intval($_GET['lines']) : 100;
        $file['tail'] = shell_exec("tail -n $file[lines] " . escapeshellarg($file['realPath']));

        return static::respond('log', $file);
    }


    protected static function getFiles()
    {
        static $files;

        if (!$files) {
            $files = static::$files;

            foreach ($files AS $path => &$file) {
                $file['path'] = $path;

                if (empty($file['title'])) {
                    $file['title'] = 'path';
                }

                if (empty($file['format'])) {
                    $file['format'] = 'raw';
                }

                list ($pathPrefix, $pathSuffix) = explode('/', $path, 2);
                if (
                    ($pathPrefix == 'logs' || $path == 'site-data/site.log')
                    && ($loggerConfig = \Site::getConfig('logger'))
                    && !empty($loggerConfig['root'])
                ) {
                    $file['realPath'] = $loggerConfig['root'] . '/' . $pathSuffix;
                } elseif ($pathPrefix == 'site-data') {
                    $file['realPath'] = Storage::getLocalStorageRoot() . '/' . $pathSuffix;
                } else {
                    $file['realPath'] = Site::$rootPath . '/' . $path;
                }

                $file['size'] = @filesize($file['realPath']) ?: null;
                $file['modified'] = @filemtime($file['realPath']) ?: null;
            }
        }

        return array_filter($files, function ($file) {
            return $file['size'] !== null;
        });
    }
}