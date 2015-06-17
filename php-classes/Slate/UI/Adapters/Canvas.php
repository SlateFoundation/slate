<?php

namespace Slate\UI\Adapters;

class Canvas implements \Slate\UI\IOmnibarSource
{
    public static $parentTree = 'Tools';

	public static function getOmnibarLinks()
	{
        $domain = \RemoteSystems\Canvas::$canvasHost ?: 'canvas.slatedemo.com'; // TODO: remove sample value

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