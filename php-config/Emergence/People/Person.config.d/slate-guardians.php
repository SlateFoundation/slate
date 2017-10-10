<?php

use Emergence\People\Person;
use Emergence\People\GuardianRelationship;


Person::$relationships['Guardians'] = [
    'type' => 'many-many',
    'class' => Person::class,
    'linkClass' => GuardianRelationship::class,
    'linkLocal' => 'PersonID',
    'linkForeign' => 'RelatedPersonID',
    'conditions' => ['Link.Class = "Emergence\\\\People\\\\GuardianRelationship"']
];

Person::$relationships['GuardianRelationships'] = [
    'type' => 'one-many',
    'class' => GuardianRelationship::class,
    'foreign' => 'PersonID',
    'conditions' => ['Class' => GuardianRelationship::class]
];