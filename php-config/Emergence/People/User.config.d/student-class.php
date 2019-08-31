<?php

// Slate subclasses and account levels
\Emergence\People\User::$subClasses[] = 'Slate\\People\\Student';
\Emergence\People\User::$fields['AccountLevel']['values'] = [
    'Disabled'
    ,'Contact'
    ,'User'
    ,'Student'
    ,'Staff'
    ,'Teacher'
    ,'Administrator'
    ,'Developer'
];