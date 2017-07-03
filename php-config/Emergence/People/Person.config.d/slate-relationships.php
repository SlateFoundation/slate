<?php

namespace Emergence\People;

use Slate\Term;
use Slate\Courses\Section;
use Slate\Courses\SectionParticipant;

$relationships = [
    'CurrentCourseSections' => [
        'type' => 'many-many',
        'class' => Section::class,
        'linkClass' => SectionParticipant::class,
        'linkLocal' => 'PersonID',
        'linkForeign' => 'CourseSectionID',
        'conditions' => function($Person) {
            if (!$Term = Term::getCurrent()) {
                $Term = Term::getNext();
            }
    
            if (!$Term) {
                return [];
            }
    
            return [
                '(Link.StartDate IS NULL OR Link.StartDate >= CURRENT_DATE)'
                ,'(Link.EndDate IS NULL OR Link.EndDate <= CURRENT_DATE)'
                ,'Related.TermID IN ('.implode(',', $Term->getConcurrentTermIDs()).')'
            ];
        }
    ]
];

Person::$relationships = array_merge(Person::$relationships, $relationships);