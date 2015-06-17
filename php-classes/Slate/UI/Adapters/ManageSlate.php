<?php

namespace Slate\UI\Adapters;

class ManageSlate implements \Slate\UI\ILinksSource
{
    public static $parentTree = 'Tools';

	public static function getLinks($context = null)
	{
		if (!empty($_SESSION['User']) && $_SESSION['User']->hasAccountLevel('Staff')) {
			$appsLinks = [
                'Manage Slate' => [
                    '_href' => '/manage',
                    '_icon' => 'tools',

                    'This Is The Omnibar' => $context == \Slate\UI\Omnibar::class ? 'hello' : null, // TODO: remove before commit
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