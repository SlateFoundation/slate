<?php

if ($GLOBALS['Session']->hasAccountLevel('User')) {
    SearchRequestHandler::$searchClasses['User'] = [
        'fields' => [
            [
                'field' => 'FirstName'
                ,'method' => 'like'
            ], [
                'field' => 'LastName'
                ,'method' => 'like'
                ], [
                'field' => 'Username'
                ,'method' => 'like'
            ], [
                'field' => 'FullName'
                ,'method' => 'sql'
                ,'sql' => 'CONCAT(FirstName," ",LastName) = "%s"'
            ]
        ]
        ,'conditions' => ['AccountLevel != "Deleted"']
    ];
}

SearchRequestHandler::$searchClasses['Tag'] = [
    'fields' => [
        'Title'
        ,[
            'field' => 'Handle'
            ,'method' => 'like'
        ]
    ]
];

SearchRequestHandler::$searchClasses['Slate\Courses\Section'] = [
    'fields' => [
        'Title'
        ,[
            'field' => 'Code'
            ,'method' => 'like'
        ]
    ]
    ,'conditions' => ['Status = "Live"']
];

SearchRequestHandler::$searchClasses['Emergence\CMS\Page'] = [
    'fields' => [
        'Title'
        ,[
            'field' => 'Handle'
            ,'method' => 'like'
        ]
    ]
    ,'conditions' => ['Class' => 'Emergence\CMS\Page', 'Status' => 'Published', 'Published IS NULL OR Published <= CURRENT_TIMESTAMP']
];

SearchRequestHandler::$searchClasses['Emergence\CMS\BlogPost'] = [
    'fields' => [
        'Title'
        ,[
            'field' => 'Handle'
            ,'method' => 'like'
        ]
    ]
    ,'conditions' => ['Class' => 'Emergence\CMS\BlogPost', 'Status' => 'Published', 'Published IS NULL OR Published <= CURRENT_TIMESTAMP']
];

SearchRequestHandler::$searchClasses['Emergence\Events\Event'] = [
    'fields' => [
        'Title'
        ,'Description'
        ,[
            'field' => 'Handle'
            ,'method' => 'like'
        ]
    ]
    ,'conditions' => ['Status = "Published"']
];
