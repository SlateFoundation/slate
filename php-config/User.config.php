<?php

User::$subClasses[] = 'Slate\\Student';
User::$fields['AccountLevel']['values'] = array(
    'Disabled'
    ,'Contact'
    ,'User'
    ,'Student'
    ,'Staff'
    ,'Teacher'
    ,'Administrator'
    ,'Developer'
);

User::$fields['AssignedPassword'] = array(
    'type' => 'string'
    ,'notnull' => false
    ,'accountLevelEnumerate' => 'Staff'
);