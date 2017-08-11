<?php

use Emergence\People\Person;
use Slate\Term;
use Slate\Courses\Section;
use Slate\Courses\SectionParticipant;


Person::$relationships['CurrentCourseSections'] = [
    'type' => 'many-many',
    'class' => Section::class,
    'linkClass' => SectionParticipant::class,
    'linkLocal' => 'PersonID',
    'linkForeign' => 'CourseSectionID',
    'conditions' => function ($Person) {
        if (!$Term = Term::getClosest()) {
            return [];
        }

        return [
            '(Link.StartDate IS NULL OR Link.StartDate >= CURRENT_DATE)',
            '(Link.EndDate IS NULL OR Link.EndDate <= CURRENT_DATE)',
            'Related.TermID IN ('.implode(',', $Term->getConcurrentTermIDs()).')'
        ];
    }
];

Person::$dynamicFields[] = 'CurrentCourseSections';

Person::$searchConditions['Course'] = [
    'qualifiers' => ['course'],
    'points' => 1,
    'join' => [
        'className' => SectionParticipant::class,
        'aliasName' => 'Participant',
        'localField' => 'ID',
        'foreignField' => 'PersonID'
    ],
    'callback' => function ($handle, $matchedCondition) {
        if (!$searchedCourse = Section::getByHandle($handle)) {
            return false;
        }

        $condition = $matchedCondition['join']['aliasName'].'.CourseSectionID'.' = '.$searchedCourse->ID;

        return $condition;
    }
];