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

Person::$searchConditions['HasGuardian'] = [
    'qualifiers' => ['has'],
    'points' => 1,
    'callback' => function ($what) {
        if ($what != 'guardian') {
            return null;
        }

        $ids = DB::allValues(
            'PersonID',
            '
                SELECT PersonID
                  FROM `%s` relationships
                 WHERE relationships.Class = "%s"
            ',
            [
                GuardianRelationship::$tableName,
                DB::escape(GuardianRelationship::class)
            ]
        );

        return count($ids) ? 'Emergence_People_Person.ID IN ('.implode(',', $ids).')' : '0';
    }
];
