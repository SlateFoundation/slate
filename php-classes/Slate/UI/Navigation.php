<?php

namespace Slate\UI;

use ActiveRecord;
use Tag;

class Navigation
{
	public static $siteMenu = [
		'Home' => '/home',
		'Blog' => '/blog',
		'Courses' => '/courses',
		'Contact Us' => '/contact'
	];

	public static function getSiteMenu()
	{
		$menu = [];

		foreach (static::$siteMenu AS $key => $value) {
			if (!$value) {
				continue;
			}

			if (is_a($value, ActiveRecord::class)) {
				if (!is_string($key)) {
					$key = $value->getTitle();
				}

				// expand a tag into a sub-menu of matched items
				if (is_a($value, Tag::class)) {
					if (!count($value->Items)) {
						continue;
					}

					$subMenu = [];
					foreach ($value->Items AS $TagItem) {
						$subMenu[$TagItem->Context->getTitle()] = $TagItem->Context->getUrl();
					}

					$value = $subMenu;
				} else {
					$value = $value->getUrl();
				}
			}
			
			$menu[$key] = $value;
		}

		return $menu;
	}
}