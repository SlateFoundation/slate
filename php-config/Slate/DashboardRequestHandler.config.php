<?php
	
namespace Slate;

DashboardRequestHandler::$sources = [
	UI\Adapters\Courses::class,
	UI\Adapters\GoogleApps::class,
	UI\Adapters\Canvas::class,
	UI\Tools::class,
	[UI\Adapters\ManageSlate::class, 'getManageLinks'],
	UI\Adapters\User::class
];