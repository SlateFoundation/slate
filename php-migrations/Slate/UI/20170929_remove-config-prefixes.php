<?php

$trees = [
    'php-config/Slate/DashboardRequestHandler.config.d',
    'php-config/Slate/UI/Omnibar.config.d',
    'php-config/Slate/UI/Navigation.config.d'
];

$renamed = 0;

foreach ($trees AS $tree) {
    foreach (Emergence_FS::getAggregateChildren($tree) AS $filename => $node) {
        if (!preg_match('/^\d+_(.*)/', $filename, $matches)) {
            continue;
        }

        $node->setName($matches[1]);
        print("Renamed \"$filename\" to \"$matches[1]\"\n");
        $renamed++;
    }
}


return $renamed ? static::STATUS_EXECUTED : static::STATUS_SKIPPED;