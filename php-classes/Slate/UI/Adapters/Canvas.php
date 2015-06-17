<?php

namespace Slate\UI\Adapters;

class Canvas implements \Slate\UI\ILinksSource
{
    public static $parentTree = 'Tools';

	public static function getLinks($context = null)
	{
        $domain = \RemoteSystems\Canvas::$canvasHost;

		if (!empty($_SESSION['User']) && $domain) {
			$canvasLinks = [
                'Canvas' => [
                    '_icon' => 'network',
                    '_href' => 'https://' . $domain
                ]
			];

            return static::$parentTree ? [static::$parentTree => $canvasLinks] : $canvasLinks;
		}

		return [];
	}
}