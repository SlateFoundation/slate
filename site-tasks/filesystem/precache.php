<?php

return [
    'title' => 'Precache parent tree',
    'description' => 'Scan parent site for new files and cache them locally',
    'icon' => 'cloud-download',
    'handler' => function () {
        if ('POST' == $_SERVER['REQUEST_METHOD']) {
            Site::$autoPull = true;
            Site::$debug = true;

            set_time_limit(0);

            $message = '';
            foreach ($_POST['collections'] as $collection) {
                if (!$collection = trim($collection)) {
                    continue;
                }

                $filesCached = Emergence_FS::cacheTree($collection, true);
                $message .= sprintf('Precached %03u files in %s'.PHP_EOL, $filesCached, $collection);
            }
        }

        return static::respond('precache', [
            'message' => $message,
        ]);
    },
];
