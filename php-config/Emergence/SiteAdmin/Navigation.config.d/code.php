<?php

Emergence\SiteAdmin\Navigation::$items['code'] = [
    'label' => 'Code',
    'url' => '/develop',
    'requireAccountLevel' => 'Developer',
    'after' => 'all'
];