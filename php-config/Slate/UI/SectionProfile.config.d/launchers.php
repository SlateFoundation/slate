<?php

Slate\UI\SectionProfile::$sources[] = function (Slate\Courses\Section $Section) {
    $links = [];

    foreach ($Section->getLaunchers() AS $launcher) {
        $links[$launcher['title']] = $launcher['url'];
    }

    return [
        'Other Websites' => $links
    ];
};