<?php

namespace Slate\UI\Adapters;

class ManageSlate implements \Slate\UI\ILinksSource
{
    public static $enabled = true;
    public static $weight = 900;
    public static $parentTree = 'Tools';
    public static $icon = 'tools';

    public static $people = 1000;
    public static $courseSections = 1100;
    public static $schoolSettings = 1200;
    public static $pages = 1300;
    public static $exports = 10000;

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

        if (is_int(static::$people)) {
            $menu['People'] = [
                '_href' => '/manage#people',
                '_icon' => 'users',
                '_weight' => static::$people
            ];
        }

        if (is_int(static::$courseSections)) {
            $menu['Course Sections'] = [
                '_href' => '/manage#course-sections',
                '_icon' => 'books',
                '_weight' => static::$courseSections
            ];
        }

        if (is_int(static::$schoolSettings)) {
            $menu['School Settings'] = [
                '_href' => '/manage#settings',
                '_icon' => 'gears',
                '_weight' => static::$schoolSettings
            ];
        }

        if (is_int(static::$pages)) {
            $menu['Pages'] = [
                '_href' => '/pages',
                '_icon' => 'records',
                '_weight' => static::$pages
            ];
        }

        if (is_int(static::$exports)) {
            $menu['Exports'] = [
                '_icon' => 'export',
                '_href' => '/exports',
                '_weight' => static::$exports
            ];
        }

        return [
            'Manage Slate' => $menu
        ];
    }
}