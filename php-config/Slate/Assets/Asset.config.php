<?php

$searchConditions['Status'] = array(
    'qualifiers' => array('any','status', 'assets-status')
    ,'points' => 1
    ,'join' => array(
        'className' => 'Slate\\Assets\\Status',
        'aliasName' => \Slate\Assets\Status::getTableAlias(),
        'localField' => 'StatusID',
        'foreignField' => 'ID'
    )
    ,'callback' => 'getStatusConditions'
);

\Slate\Assets\Asset::$searchConditions = array_merge(\Slate\Assets\Asset::$searchConditions, $searchConditions);