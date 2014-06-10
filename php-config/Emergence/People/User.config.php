<?php

\Emergence\People\User::$subClasses[] = 'Slate\\Student';
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

\Emergence\People\User::$fields['AssignedPassword'] = array(
    'type' => 'string'
    ,'notnull' => false
    ,'accountLevelEnumerate' => 'Staff'
);