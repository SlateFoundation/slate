<?php

namespace Slate\Standards;

use Slate\Term;
use Slate\Courses\Section;
use Slate\People\Student;

class PromptGrade extends \VersionedRecord
{
    // VersionedRecord configuration
    public static $historyTable = 'history_standards_prompt_grades';

    // ActiveRecord configuration
    public static $tableName = 'standards_prompt_grades';
    public static $singularNoun = 'standards prompt grade';
    public static $pluralNoun = 'standards prompt grades';

    public static $fields = [
        'TermID' => 'uint',
        'CourseSectionID' => 'uint',
        'StudentID' => 'uint',
        'PromptID' => 'uint',
        'Grade' => [
            'type' => 'enum',
            'values' => ['1','2','3','4','N/A'],
            'notnull' => false
        ]
    ];

    public static $indexes = [
        'PromptGrade' => [
            'fields' => ['TermID', 'CourseSectionID', 'StudentID', 'PromptID'],
            'unique' => true
        ]
    ];

    public static $relationships = [
        'Term' => [
            'type' => 'one-one',
            'class' => Term::class
        ],
        'Section' => [
            'type' => 'one-one',
            'class' => Section::class,
            'local' => 'CourseSectionID'
        ],
        'Student' => [
            'type' => 'one-one',
            'class' => Student::class
        ],
        'Prompt' => [
            'type' => 'one-one',
            'class' => Prompt::class
        ],
        // TODO: test
        'WorksheetAssignment' => [
            'type' => 'one-one',
            'class' => StandardsWorksheetAssignment::class,
            'local' => 'CourseSectionID',
            'foreign' => 'CourseSectionID',
            'conditions' => [__CLASS__, 'getWorksheetAssignmentConditions']
        ]
    ];

    public static $validators = [
        'Term' => 'require-relationship',
        'Section' => 'require-relationship',
        'Student' => 'require-relationship',
        'Prompt' => 'require-relationship'
    ];

    public static $dynamicFields = [
        'Term',
        'Section',
        'Student',
        'Prompt'
    ];

    protected static function getWorksheetAssignmentConditions($Grade, $relationship, $rel, $value) {
        return [
            'TermID' => $Grade->TermID
        ];
    }
}