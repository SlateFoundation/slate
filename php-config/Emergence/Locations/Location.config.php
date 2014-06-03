<?php

Emergence\Locations\Location::$relationships['Courses'] = array(
    'type' => 'one-many'
    ,'class' => 'Slate\\Courses\\Course'
    ,'foreign' => 'LocationID'
);