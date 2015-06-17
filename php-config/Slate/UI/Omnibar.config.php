<?php

namespace Slate\UI;

Omnibar::$sources = [
	Adapters\Courses::class,
	Adapters\ManageSlate::class,
	Adapters\GoogleApps::class,
	Adapters\Canvas::class,
	Tools::class,
	Adapters\User::class
];