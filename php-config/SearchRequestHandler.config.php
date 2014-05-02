<?php

if ($GLOBALS['Session']->hasAccountLevel('User')) {
    SearchRequestHandler::$searchClasses['User'] = array(
        'fields' => array(
            array(
                'field' => 'FirstName'
                ,'method' => 'like'
            ), array(
                'field' => 'LastName'
                ,'method' => 'like'
                ), array(
                'field' => 'Username'
                ,'method' => 'like'
            ), array(
                'field' => 'FullName'
                ,'method' => 'sql'
                ,'sql' => 'CONCAT(FirstName," ",LastName) = "%s"'
            )
        )
        ,'conditions' => array('AccountLevel != "Deleted"')
    );
}

SearchRequestHandler::$searchClasses['Slate\Courses\Section'] = array(
    'fields' => array(
        'Title'
        ,array(
            'field' => 'Code'
            ,'method' => 'like'
        )
        ,array(
            'field' => 'Handle'
            ,'method' => 'like'
        )
    )
    ,'conditions' => array('Status = "Live"')
);

SearchRequestHandler::$searchClasses['Emergence\CMS\Page'] = array(
    'fields' => array(
        'Title'
        ,array(
            'field' => 'Handle'
            ,'method' => 'like'
        )
    )
    ,'conditions' => array('Class' => 'Emergence\CMS\Page', 'Status' => 'Published', 'Published IS NULL OR Published <= CURRENT_TIMESTAMP')
);

SearchRequestHandler::$searchClasses['Emergence\CMS\BlogPost'] = array(
    'fields' => array(
        'Title'
        ,array(
            'field' => 'Handle'
            ,'method' => 'like'
        )
    )
    ,'conditions' => array('Class' => 'Emergence\CMS\BlogPost', 'Status' => 'Published', 'Published IS NULL OR Published <= CURRENT_TIMESTAMP')
);

SearchRequestHandler::$searchClasses['Emergence\Events\Event'] = array(
    'fields' => array(
        'Title'
        ,'Description'
        ,array(
            'field' => 'Handle'
            ,'method' => 'like'
        )
    )
    ,'conditions' => array('Status = "Published"')
);
