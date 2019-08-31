<?php

Emergence\Locations\Location::$relationships['Courses'] = [
    'type' => 'one-many'
    ,'class' => 'Slate\\Courses\\Course'
    ,'foreign' => 'LocationID'
];