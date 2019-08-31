<?php

$GLOBALS['Session']->requireAccountLevel('Administrator');

if (!empty($_POST['username'])) {
    if (!$User = User::getByUsername($_POST['username'])) {
        RequestHandler::throwNotFoundError('Username/email not found');
    }

    $GLOBALS['Session']->Person = $User;
    $GLOBALS['Session']->save();

    RequestHandler::respond('message', array(
        'message' => sprintf('You are now logged in as %s. Logout and then log back into your normal account when you are finished.', $User->Username),
        'returnURL' => '/',
        'returnLabel' => 'Continue to '.Site::$hostname.' as '.$User->Username
    ));
}


RequestHandler::respond('masquerade');