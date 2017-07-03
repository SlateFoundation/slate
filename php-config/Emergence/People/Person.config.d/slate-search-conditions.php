<?php

namespace Emergence\People;

use DB;

use Slate\Term;
use Slate\Courses\Section;
use Slate\Courses\SectionParticipant;

$searchConditions = [
    'Course' => [
        'qualifiers' => ['course'],
        'points' => 1,
        'join' => [
            'className' => SectionParticipant::class,
            'aliasName' => 'Participant',
            'localField' => 'ID',
            'foreignField' => 'PersonID'
        ],
        'callback' => function($handle, $matchedCondition) {
            $searchedCourse = Section::getByHandle($handle);
    
            if (!$searchedCourse) {
                return false;
            }
    
            $condition = $matchedCondition['join']['aliasName'].'.CourseSectionID'.' = '.$searchedCourse->ID;
    
            return $condition;
        }
    ],
    
    'Advisor' => [
        'qualifiers' => ['advisor']
        ,'points' => 1
        ,'callback' => function($username, $matchedCondition) {
            if (!$Advisor = User::getByUsername($username)) {
                return false;
            }
    
            if (!$currentTerm = Term::getClosest()) {
                return false;
            }
    
            return sprintf(
                'GraduationYear >= %u AND AdvisorID = %u'
                , date('Y', strtotime($currentTerm->getMaster()->EndDate))
                , $Advisor->ID
            );
        }
    ],
    
    'WardAdvisor' => [
        'qualifiers' => ['ward-advisor'],
        'points' => 1,
        'callback' => function($username, $matchedCondition) {
            if (!$Advisor = User::getByUsername($username)) {
                return false;
            }
    
            if (!$currentTerm = Term::getClosest()) {
                return false;
            }
    
            return sprintf(
                'ID IN ('
                    .'SELECT relationships.RelatedPersonID'
                    .' FROM people Student'
                    .' RIGHT JOIN `%s` relationships'
                        .' ON (relationships.PersonID = Student.ID AND relationships.Class = "%s")'
                    .' WHERE'
                        .' GraduationYear >= %u'
                        .' AND AdvisorID = %u'
                .')',
                Relationship::$tableName,
                DB::escape(GuardianRelationship::class),
                date('Y', strtotime($currentTerm->getMaster()->EndDate)),
                $Advisor->ID
            );
        }
    ],
    
    'ID' => [
        'qualifiers' => ['id'],
        'points' => 3,
        'callback' => function($ids, $matchedCondition) {
    
            $ids = explode(",", $ids);
    
            foreach ($ids as $id) {
                if (is_numeric($id) && intval($id) > 0) {
                    $validIds[] = DB::escape($id);
                }
            }
    
            if (!empty($validIds)) {
                return $condition = sprintf('`%s`.ID IN (%s)', Person::getTableAlias(), join(", ", $validIds));
            } else {
                return false;
            }
        }
    ],
    
    'Class' => [
        'qualifiers' => ['class', 'Class'],
        'points' => 3,
        'callback' => function($class, $matchedCondition) {
            if ($class) {
                return sprintf('%1$s.Class = "%2$s"', Person::getTableAlias(), DB::escape($class));
            }
    
            return false;
        }
    ]
];

Person::$searchConditions = array_merge(Person::$searchConditions, $searchConditions);