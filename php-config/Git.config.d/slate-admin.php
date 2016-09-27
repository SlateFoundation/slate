<?php

Git::$repositories['slate-admin'] = [
    'remote' => 'https://github.com/SlateFoundation/slate-admin.git',
    'originBranch' => 'development',
    'workingBranch' => 'development',
    'trees' => [
        'docs/slate-admin',
        'html-templates/app/SlateAdmin',
        'sencha-workspace/SlateAdmin' => [
            'exclude' => [
                '#^/bootstrap\\.#' // don't sync generated bootstrap files
            ]
        ],
        'site-root/manage.php'
    ]
];