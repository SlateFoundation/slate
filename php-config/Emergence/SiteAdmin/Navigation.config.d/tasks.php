<?php

Emergence\SiteAdmin\Navigation::$items['tasks'] = [
    'label' => 'Tasks',
    'url' => '/site-admin/tasks',
    'after' => 'dashboard',
    'before' => ['logs', 'sources', 'migrations']
];