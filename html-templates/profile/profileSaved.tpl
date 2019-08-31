<?php

$profileParams = array('status' => 'saved');

if ($GLOBALS['Session']->PersonID && $GLOBALS['Session']->PersonID != $this->scope['data']->ID) {
    $profileParams['person'] = $this->scope['data']->ID;
}

Site::redirect('/profile', $profileParams);

?>