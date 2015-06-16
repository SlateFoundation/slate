<?php

namespace Slate\UI;

use RemoteSystems\GoogleApps;
use RemoteSystems\Canvas;

$isLoggedIn = !empty($_SESSION['User']);
$isStaff = $isLoggedIn && $_SESSION['User']->hasAccountLevel('Staff');
$isAdmin = $isLoggedIn && $_SESSION['User']->hasAccountLevel('Administrator');

if ($isStaff) {
    Tools::appendTools([
        'Manage Slate' => [
            'People' => '/manage#people',
            'Course Sections' => '/manage#course-sections',
            'Pages' => '/pages',
            // TODO: comment these out
            'Narratives' => '/manage#progress/narratives',
            'Standards' => '/manage#progress/standards',
            'Interims' => '/manage#progress/interims'
    	]
    ]);
}


//GoogleApps::$domain = 'slatedemo.com'; // TODO: remove

if (GoogleApps::$domain) {
    Tools::appendTools([
        'Google Apps' => [
            'Google Apps for Education' => $isAdmin ? [
                '_icon' => 'gapps',
                '_href' => 'https://admin.google.com/a/' . GoogleApps::$domain
            ] : null,
            'Email' => [
                '_icon' => 'gmail',
                '_href' => 'https://mail.google.com/a/' . GoogleApps::$domain
            ],
            'Drive' => [
                '_icon' => 'gdrive',
                '_href' => 'https://drive.google.com/a/' . GoogleApps::$domain
            ],
            'Calendar' => [
                '_icon' => 'gcal',
                '_href' => 'https://www.google.com/calendar/hosted/' . GoogleApps::$domain
            ],
            'Sites' => [
                '_icon' => 'gsites',
                '_href' => 'https://sites.google.com/a/' . GoogleApps::$domain
            ]
        ]
    ]);
}

//Canvas::$canvasHost = 'canvas.slatedemo.com'; // TODO: remove

if (Canvas::$canvasHost) {
    Tools::$tools['Canvas'] = 'https://' . Canvas::$canvasHost;
}

Tools::$tools['Naviance'] = 'http://www.naviance.com/'; // TODO: remove