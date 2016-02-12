<?php

namespace Slate\UI\Adapters;

use Slate\UI\Omnibar;

class User implements \Slate\UI\ILinksSource
{
    public static function getLinks($context = null)
    {
        if ($User = $_SESSION['User']) {
            return [
                $User->FullName => [
                    '_shortLabel' => $User->FirstName,
                    '_href' => $User->getUrl(),
                    '_iconSrc' => $User->PrimaryPhoto ? $User->getThumbnailUrl(Omnibar::$preferredIconSize) : null,
                    'My Profile' => [
                        '_icon' => 'user',
                        '_href' => $User->getUrl()
                    ],
                    'Edit Profile' => [
                        '_icon' => 'gearhead',
                        '_href' => '/profile'
                    ],
                    'My Drafts' => [
                        '_icon' => 'writing',
                        '_href' => '/drafts'
                    ],
                    'Log Out' => [
                        '_icon' => 'logout',
                        '_href' => '/logout?return='.urlencode($_SERVER['REQUEST_URI'])
                    ]
                ]
            ];
        }

        return [
            'Log In' => '/login?return='.urlencode($_SERVER['REQUEST_URI'])
        ];
    }
}