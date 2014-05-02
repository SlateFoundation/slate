<?php

$GLOBALS['Session']->requireAccountLevel('Staff');

Sencha_RequestHandler::respond('app/SlateAdmin/ext', array(
    'App' => Sencha_App::getByName('SlateAdmin')
	,'mode' => 'production'
));