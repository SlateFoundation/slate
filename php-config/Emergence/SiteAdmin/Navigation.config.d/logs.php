<?php

Emergence\SiteAdmin\Navigation::$items['logs'] = [
    'label' => 'Logs',
    'url' => '/site-admin/logs',
    'requireAccountLevel' => 'Developer',
    'after' => 'sources'
];