<?php

namespace Slate\UI\Adapters;

class ManageSlate implements \Slate\UI\ILinksSource
{
    public static $parentTree = 'Tools';

    public static function getLinks($context = null)
    {
        $manageLinks = static::getManageLinks();

        return !empty($manageLinks) && static::$parentTree ? [static::$parentTree => $manageLinks] : $manageLinks;
    }

    public static function getManageLinks()
    {
        if (empty($_SESSION['User']) || !$_SESSION['User']->hasAccountLevel('Staff')) {
            return [];
        }

        return [
            'Manage Slate' => [
                '_href' => '/manage',
                '_icon' => 'tools',

                'People' => [
                    '_href' => '/manage#people',
                    '_icon' => 'users'
                ],
                'Course Sections' => [
                    '_href' => '/manage#course-sections',
                    '_icon' => 'books'
                ],
                'School Settings' => [
                    '_href' => '/manage#settings',
                    '_icon' => 'gears'
                ],
                'Pages' => [
                    '_href' => '/pages',
                    '_icon' => 'records'
                ]
            ]
        ];
    }
}