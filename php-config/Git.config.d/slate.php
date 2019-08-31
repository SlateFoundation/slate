<?php

Git::$repositories['slate'] = [
    'remote' => 'https://github.com/SlateFoundation/slate.git',
    'originBranch' => 'emergence/vfs-site/v2',
    'workingBranch' => 'emergence/vfs-site/v2',
    'trees' => [
        'api-docs',
        'content-blocks',
        'data-exporters',
        'dwoo-plugins',
        'event-handlers',
        'html-templates',
        'php-classes',
        'php-config',
        'php-migrations',
        'phpunit-tests',
        'site-root',
        'site-tasks',
        'webapp-builds',
        // 'webapp-plugin-builds'
    ]
];
