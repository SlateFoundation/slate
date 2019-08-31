<?php

if (!empty($GLOBALS['Session']) && $GLOBALS['Session']->hasAccountLevel('User')) {
    SearchRequestHandler::$searchClasses[Emergence\People\User::class] = [
        'weight' => -1000,
        'fields' => [
            [
                'field' => 'FirstName',
                'method' => 'like'
            ],
            [
                'field' => 'LastName',
                'method' => 'like'
            ],
            [
                'field' => 'Username',
                'method' => 'like'
            ],
            [
                'field' => 'FullName',
                'method' => 'sql',
                'sql' => 'CONCAT(FirstName, " ", LastName) = "%s"'
            ]
        ],
        'conditions' => ['AccountLevel != "Disabled"']
    ];
}
