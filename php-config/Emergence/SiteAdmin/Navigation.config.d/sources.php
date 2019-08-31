<?php

Emergence\SiteAdmin\Navigation::$items['sources'] = [
    'label' => 'Sources',
    'url' => '/site-admin/sources',
    'requireAccountLevel' => 'Developer',
    'after' => 'migrations'
];