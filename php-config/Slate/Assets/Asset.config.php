<?php

namespace Slate\Assets;

Asset::$searchConditions['Status'] = [
    'qualifiers' => array('any','status', 'assets-status')
    ,'points' => 1
    ,'join' => array(
        'className' => Status::class,
        'aliasName' => Status::getTableAlias(),
        'localField' => 'StatusID',
        'foreignField' => 'ID'
    )
    ,'callback' => 'getStatusConditions'
];