<?php

namespace Slate\UI\Adapters;

class ManageSlate implements \Slate\UI\ILinksSource
{
    public static $enabled = true;
    public static $weight = 900;
    public static $parentTree = 'Tools';
    public static $icon = 'tools';

    public static $people = true;
    public static $courseSections = true;
    public static $schoolSettings = true;
    public static $pages = true;

    public static function getLinks($context = null)
    {
        $manageLinks = static::getManageLinks();
        
        if (empty($manageLinks)) {
            return null;
        }

        return static::$parentTree ? [static::$parentTree => $manageLinks] : $manageLinks;
    }

    public static function getManageLinks()
    {
        if (!static::$enabled || empty($_SESSION['User']) || !$_SESSION['User']->hasAccountLevel('Staff')) {
            return [];
        }

        $menu = [
            '_href' => '/manage',
            '_icon' => static::$icon,
            '_weight' => static::$weight
        ];

        if (static::$people) {
            $menu['People'] = [
                '_href' => '/manage#people',
                '_icon' => 'users'
            ];
        }

        if (static::$courseSections) {
            $menu['Course Sections'] = [
                '_href' => '/manage#course-sections',
                '_icon' => 'books'
            ];
        }

        if (static::$schoolSettings) {
            $menu['School Settings'] = [
                '_href' => '/manage#settings',
                '_icon' => 'gears'
            ];
        }

        if (static::$pages) {
            $menu['Pages'] = [
                '_href' => '/pages',
                '_icon' => 'records'
            ];
        }

        return [
            'Manage Slate' => $menu
        ];
    }
}