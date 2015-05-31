<?php

Emergence\Locations\Location::$relationships['Courses'] = array(
    'type' => 'one-many'
    ,'class' => 'Slate\\Courses\\Course'
    ,'foreign' => 'LocationID'
);

Emergence\Locations\Location::$relationships['Children'] = array(
    'type' => 'one-many',
    'class' => '\\Emergence\\Locations\\Location',
    'foreign' => 'ParentID'
);

Emergence\Locations\Location::$dynamicFields['assetsCount'] = array(
    'method' => function($Location, $stringsOnly, $options, $field) {
        try {
            $results = \DB::oneValue(
                'SELECT count(*) FROM `%s` WHERE LocationID IN (SELECT ID FROM `%s` location WHERE location.Left BETWEEN %u AND %u)',
                array(
                    Slate\Assets\Asset::$tableName,
                    Emergence\Locations\Location::$tableName,
                    $Location->Left,
                    $Location->Right
                )
            );
        } catch (\TableNotFoundException $e) {
            $results = 0;
        }
        
        return $results;
    }
);

Emergence\Locations\Location::$dynamicFields['data'] = array(
    'method' => function($Location, $stringsOnly, $options, $field) {
        return $Location->Children;
    },
    'relationship' => 'Children'
);