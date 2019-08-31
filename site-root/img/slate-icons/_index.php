<?php

// \Debug::dumpVar(\Emergence_FS::getAggregateChildren('site-root/img/slate-icons'));
$files = \Emergence_FS::getAggregateChildren('site-root/img/slate-icons');

echo "<style> figure { display: inline-block; margin: 1em; text-align: center; vertical-align: top; } </style>";

foreach ($files as $file) {
    if ($file->Type != 'image/svg+xml') {
        continue;
    }

    $handle = $file->Handle;

    echo "<figure><img src='/img/slate-icons/$handle' width='96' height='96'><figcaption>$handle</figcaption></figure>";
}