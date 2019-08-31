<?php

use Emergence\People\Person;
use Emergence\People\User;
use Emergence\People\GuardianRelationship;
use Slate\Term;


Person::$relationships['Wards'] = [
    'type' => 'many-many',
    'class' => Person::class,
    'linkClass' => GuardianRelationship::class,
    'linkLocal' => 'RelatedPersonID',
    'linkForeign' => 'PersonID',
    'conditions' => ['Link.Class = "'.DB::escape(GuardianRelationship::class).'"']
];

Person::$dynamicFields[] = 'Wards';

Person::$searchConditions['WardAdvisor'] = [
    'qualifiers' => ['ward-advisor'],
    'points' => 1,
    'callback' => function ($username) {
        if (!$Advisor = User::getByUsername($username)) {
            return false;
        }

        if (!$currentTerm = Term::getClosest()) {
            return false;
        }

        $ids = DB::allValues(
            'RelatedPersonID',
            '
                SELECT RelatedPersonID
                  FROM people Student
                 RIGHT JOIN `%s` relationships
                    ON relationships.PersonID = Student.ID
                   AND relationships.Class = "%s"
                 WHERE GraduationYear >= %u
                   AND AdvisorID = %u
            ',
            [
                GuardianRelationship::$tableName,
                DB::escape(GuardianRelationship::class),
                date('Y', strtotime($currentTerm->getMaster()->EndDate)),
                $Advisor->ID
            ]
        );

        return count($ids) ? 'Emergence_People_Person.ID IN ('.implode(',', $ids).')' : '0';
    }
];