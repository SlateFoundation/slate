<?php

namespace Slate\UI;

use Slate;

class Tools implements IOmnibarSource
{
	public static $tools = [];
	
	public static function __classLoaded()
	{
		// append legacy manage/web tools
		if (!empty(Slate::$manageTools)) {
			static::appendtools(Slate::$manageTools);
		}

		if (!empty(Slate::$webTools)) {
			static::appendtools(Slate::$webTools);
		}
	}

	public static function appendTools(array $tools)
	{
		foreach ($tools AS $key => $value) {
			if (
				is_array($value) &&
				!empty(static::$tools[$key]) &&
				is_array(static::$tools[$key])
			) {
				static::$tools[$key] = array_merge(static::$tools[$key], $value);
			} else {
				static::$tools[$key] = $value;
			}
		}
	}

	public static function getOmnibarItems()
	{
		return [
			'Tools' => empty($_SESSION['User']) ? null : [
//				'_iconSrc' => 'http://placehold.it/48',
				'_items' => static::$tools
			]
		];
	}
}