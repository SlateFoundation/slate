<?php

Slate\UI\Navigation::$links = [
	Emergence\CMS\Page::getByHandle('about'),
	'Students' => Tag::getByHandle('students'),
	'Parents' => Tag::getByHandle('parents'),
	'Staff' => Tag::getByHandle('staff'),
	'Community' => Tag::getByHandle('community'),
	'Calendar' => '/events',
	'Contact Us' => '/contact'
];