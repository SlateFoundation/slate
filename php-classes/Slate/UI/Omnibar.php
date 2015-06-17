<?php

namespace Slate\UI;

class Omnibar
{
	public static $sources = [];
	public static $preferredIconSize = 48;

	public static function getLinks()
	{
		$links = [];

		foreach (static::$sources AS $source) {
			if (is_subclass_of($source, IOmnibarSource::class)) {
				$newLinks = $source::getOmnibarLinks();
			} elseif (is_callable($source)) {
				$newLinks = call_user_func($source);
			} elseif (is_array($source) || $source instanceof Traversable || $source instanceof stdClass) {
				$newLinks = $source;
			} else {
				continue;
			}

			$links = LinkUtil::mergeTree($links, LinkUtil::normalizeTree($newLinks));
		}

		return $links;
	}
}