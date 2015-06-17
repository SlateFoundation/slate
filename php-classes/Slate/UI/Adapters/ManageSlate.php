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
                    'Pages' => '/pages',

                    // TODO: remove these
                    'Narratives' => '/manage#progress/narratives',
                    'Standards' => '/manage#progress/standards',
                    'Interims' => '/manage#progress/interims'
                ]
			];

            return static::$parentTree ? [static::$parentTree => $appsLinks] : $appsLinks;
		}

		return [];
	}
}