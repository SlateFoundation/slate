<?php

if ($_EVENT['Person']->TemporaryPassword && $_EVENT['Person']->verifyPassword($_EVENT['Person']->TemporaryPassword)) {
    $params = [];

    if (!empty($_EVENT['requestData']['return'])) {
        $params['return'] = $_EVENT['requestData']['return'];
    }

    Site::redirect('/register/set-password', $params);
}