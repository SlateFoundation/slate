<?php

namespace Slate\People;

use DB;

use Slate\Courses\Section;
use Slate\Courses\SectionParticipant;
use Slate\Term;

$courseSectionsInTerm = DB::allValues(
    'ID',
    '
        SELECT ID
          FROM `%s`
         WHERE TermID IN (%s)
    ',
    [
        Section::$tableName,
        join(',', Term::getClosest()->getMaster()->getContainedTermIDs())
    ]
);

Student::$relationships['CurrentSections'] = [
    'type' => 'many-many'
    ,'class' => Section::class
    ,'linkClass' => SectionParticipant::class
    ,'linkLocal' => 'PersonID'
    ,'linkForeign' => 'CourseSectionID'
    ,'conditions' => [
        sprintf('(Link.CourseSectionID IN(%s))', join(',', $courseSectionsInTerm)),
        '(Link.StartDate IS NULL OR DATE(Link.StartDate) <= CURRENT_DATE)',
        '(Link.EndDate IS NULL OR DATE(Link.EndDate) >= CURRENT_DATE)'
    ]
];