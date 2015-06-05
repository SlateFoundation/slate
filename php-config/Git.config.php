<?php

Git::$repositories['slate'] = [
    'remote' => 'git@github.com:SlateFoundation/slate.git',
    'originBranch' => 'master',
    'workingBranch' => 'instances/' . Site::getConfig('primary_hostname'),
    'localOnly' => true,
    'trees' => [
        'dwoo-plugins',
        'event-handlers',
        'ext-library',
        'html-templates',
        'mail-handlers',
        'php-classes',
        'php-config',
        'php-migrations',
        'phpunit-tests',
        'sencha-workspace',
        'site-root'
    ]
];
