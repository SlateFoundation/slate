<?php

namespace Emergence\People;

$dynamicFields = [
    'Wards'  
];

Person::$dynamicFields = array_merge(Person::$dynamicFields, $dynamicFields);