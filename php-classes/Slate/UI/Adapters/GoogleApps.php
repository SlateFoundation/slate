<?php

namespace Slate\UI\Adapters;

class GoogleApps implements \Slate\UI\ILinksSource
{
    public static $parentTree = 'Tools';

    public static function getLinks($context = null)
    {
        $appsLinks = static::getGoogleAppsLinks();

        return static::$parentTree ? [static::$parentTree => $appsLinks] : $appsLinks;
    }

    public static function getGoogleAppsLinks()
    {
        $domain = \RemoteSystems\GoogleApps::$domain;

        if (!empty($_SESSION['User']) && $domain) {
            return [
                'Google Apps' => [
                    '_icon' => 'gapps',
                    '_href' => $_SESSION['User']->hasAccountLevel('Administrator') ? 'https://admin.google.com/a/'.$domain : null,
                    'Email' => [
                        '_icon' => 'gmail',
                        '_href' => 'https://mail.google.com/a/'.$domain
                    ],
                    'Drive' => [
                        '_icon' => 'gdrive',
                        '_href' => 'https://drive.google.com/a/'.$domain
                    ],
                    'Calendar' => [
                        '_icon' => 'gcal',
                        '_href' => 'https://www.google.com/calendar/hosted/'.$domain
                    ],
                    'Sites' => [
                        '_icon' => 'gsites',
                        '_href' => 'https://sites.google.com/a/'.$domain
                    ]
                ]
            ];
        }

        return null;
    }
}