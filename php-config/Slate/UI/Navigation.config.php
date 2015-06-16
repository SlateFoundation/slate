<?php

Slate\UI\Navigation::$siteMenu = [
	Emergence\CMS\Page::getByHandle('about'),
	'Students' => Tag::getByHandle('site.students'),
	'Parents' => Tag::getByHandle('site.parents'),
	'Staff' => Tag::getByHandle('site.staff'),
	'Community' => Tag::getByHandle('site.community'),
	'Calendar' => '/events',
	'Contact Us' => '/contact'
];