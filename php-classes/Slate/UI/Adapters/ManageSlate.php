<?php

namespace Slate\UI\Adapters;

class ManageSlate implements \Slate\UI\IOmnibarSource
{
    public static $parentTree = 'Tools';

	public static function getOmnibarLinks()
	{
		if (!empty($_SESSION['User']) && $_SESSION['User']->hasAccountLevel('Staff')) {
			$appsLinks = [
                'Manage Slate' => [
                    '_href' => '/manage',
                    '_icon' => 'tools',

                    'People' => '/manage#people',
                    'Course Sections' => '/manage#course-sections',
                    'Settings' => '/manage#settings',
                    'Pages' => '/pages'
                ]
			];

            return static::$parentTree ? [static::$parentTree => $appsLinks] : $appsLinks;
		}

		return [];
	}
}