<?php

// Slate subclasses and account levels
\Emergence\People\User::$subClasses[] = 'Slate\\People\\Student';
\Emergence\People\User::$fields['AccountLevel']['values'] = array(
    'Disabled'
    ,'Contact'
    ,'User'
    ,'Student'
    ,'Staff'
    ,'Teacher'
    ,'Administrator'
    ,'Developer'
);


// store plaintext passwords -- // TODO: only store the first password? OR store an unsalted SHA1 hash for exporting?
\Emergence\People\User::$fields['AssignedPassword'] = array(
    'type' => 'string'
    ,'notnull' => false
    ,'accountLevelEnumerate' => 'Staff'
);
\Emergence\People\User::$onPasswordSet = function($password, $User) {
    $User->AssignedPassword = $password;
};