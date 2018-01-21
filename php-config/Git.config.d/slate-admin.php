<?php

Git::$repositories['slate-admin'] = [
    'remote' => 'https://github.com/SlateFoundation/slate-admin.git',
    'originBranch' => 'develop',
    'workingBranch' => 'develop',
    'trees' => [
        'docs/slate-admin',
        'html-templates/webapps/SlateAdmin',
        'php-classes/SlateAdmin',
        'sencha-workspace/SlateAdmin' => [
            'exclude' => [
                '#^/bootstrap\\.#' // don't sync generated bootstrap files
            ]
        ],
        'site-root/manage.php'
    ]
];
