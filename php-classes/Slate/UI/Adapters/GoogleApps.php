<?php

namespace Slate\UI\Adapters;

class GoogleApps implements \Slate\UI\IOmnibarSource
{
    public static $parentTree = 'Tools';

	public static function getOmnibarLinks()
	{
        $domain = \RemoteSystems\GoogleApps::$domain;

		if (!empty($_SESSION['User']) && $domain) {
			$appsLinks = [
                'Google Apps' => [
                    '_icon' => 'gapps',
                    '_href' => $_SESSION['User']->hasAccountLevel('Administrator') ? 'https://admin.google.com/a/' . $domain : null,
                    'Email' => [
                        '_icon' => 'gmail',
                        '_href' => 'https://mail.google.com/a/' . $domain
                    ],
                    'Drive' => [
                        '_icon' => 'gdrive',
                        '_href' => 'https://drive.google.com/a/' . $domain
                    ],
                    'Calendar' => [
                        '_icon' => 'gcal',
                        '_href' => 'https://www.google.com/calendar/hosted/' . $domain
                    ],
                    'Sites' => [
                        '_icon' => 'gsites',
                        '_href' => 'https://sites.google.com/a/' . $domain
                    ]
                ]
			];

            return static::$parentTree ? [static::$parentTree => $appsLinks] : $appsLinks;
		}

		return [];
	}
}