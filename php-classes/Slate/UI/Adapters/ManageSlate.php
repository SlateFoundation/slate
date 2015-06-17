<?php

namespace Slate\UI\Adapters;

class ManageSlate implements \Slate\UI\ILinksSource
{
    public static $parentTree = 'Tools';

	public static function getLinks($context = null)
	{
		if (!empty($_SESSION['User']) && $_SESSION['User']->hasAccountLevel('Staff')) {
			$manageLinks = static::getManageLinks();

            return static::$parentTree ? [static::$parentTree => $manageLinks] : $manageLinks;
		}

		return [];
	}

    public static function getManageLinks()
    {
        return [
            'Manage Slate' => [
                '_href' => '/manage',
                '_icon' => 'tools',

                'People' => '/manage#people',
                'Course Sections' => '/manage#course-sections',
                'Settings' => '/manage#settings',
                'Pages' => '/pages'
            ]
		];
    }
}