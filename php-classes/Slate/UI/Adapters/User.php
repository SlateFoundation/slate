<?php

namespace Slate\UI\Adapters;

use Slate\UI\Omnibar;

class User implements \Slate\UI\ILinksSource
{
    public static $enabled = true;
    public static $weight = 1000;

    public static $logIn = true;

    public static $viewProfile = true;
    public static $editProfile = true;
    public static $drafts = true;
    public static $logOut = true;

    public static function getLinks($context = null)
    {
        if (!static::$enabled) {
            return [];
        }

        $links = [];

        if (isset($_SESSION['User']) && $User = $_SESSION['User']) {
            $userMenu = [
                '_shortLabel' => $User->FirstName,
                '_href' => $User->getUrl(),
                '_weight' => static::$weight,
                '_iconSrc' => $User->PrimaryPhoto ? $User->getThumbnailUrl(Omnibar::$preferredIconSize) : null
            ];

            if (static::$viewProfile) {
                $userMenu['My Profile'] = [
                    '_icon' => 'user',
                    '_href' => $User->getUrl()
                ];
            }

            if (static::$editProfile) {
                $userMenu['Edit Profile'] = [
                    '_icon' => 'gearhead',
                    '_href' => '/profile'
                ];
            }

            if (static::$drafts) {
                $userMenu['My Drafts'] = [
                    '_icon' => 'writing',
                    '_href' => '/drafts'
                ];
            }

            if (static::$logOut) {
                $userMenu['Log Out'] = [
                    '_icon' => 'logout',
                    '_href' => '/logout?return='.urlencode($_SERVER['REQUEST_URI'])
                ];
            }

            $links[$User->FullName] = $userMenu;
        } elseif (static::$logIn) {
            $return = '';
            if (!empty($_SERVER['REQUEST_URI'])) {
                $return = '?return='.urlencode($_SERVER['REQUEST_URI']);
            }
            $links['Log In'] = '/login'.$return;
        }

        return $links;
    }
}