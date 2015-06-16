<?php

namespace Slate\UI;

use ActiveRecord, UserUnauthorizedException;
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
					$subMenu = [];
					foreach ($value->Items AS $TagItem) {
						try {
							$subMenu[$TagItem->Context->getTitle()] = $TagItem->Context->getUrl();
						} catch (UserUnauthorizedException $e) {
							continue;
						}
					}

					if (!count($subMenu)) {
						continue;
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