<?php

Git::$repositories['slatefoundation-v1'] = array(
    'remote' => 'git@github.com:SlateFoundation/slate.git'
    ,'originBranch' => 'master'
    ,'workingBranch' => 'v1.slate.is'
    ,'localOnly' => true
    ,'trees' => array(
        'ext-library'
        ,'html-templates'
        ,'php-classes'
        ,'php-config'
        ,'phpunit-tests'
        ,'sencha-build'
        ,'sencha-workspace'
        ,'sencha-docs'
        ,'site-root'
    )
);