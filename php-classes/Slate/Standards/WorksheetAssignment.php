<?php

namespace Slate\Standards;

use Slate\Term;
use Slate\Courses\Section;

class WorksheetAssignment extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'standards_worksheet_assignments';

    public static $fields = [
        'TermID' => 'uint',
        'CourseSectionID' => 'uint',
        'WorksheetID' => [
            'type' => 'uint',
            'notnull' => false
        ],
        'Description' => [
            'type' => 'clob',
            'notnull' => false
        ]
    ];

    static $relationships = [
        'Term' => [
            'type' => 'one-one',
            'class' => Term::class
        ],
        'CourseSection' => [
            'type' => 'one-one',
            'class' => Section::class
        ],
        'Worksheet' => [
            'type' => 'one-one',
            'class' => Worksheet::class
        ]
    ];

    public static $validators = [
        'Term' => 'require-relationship',
        'CourseSection' => 'require-relationship'
    ];

    public static $indexes = [
        'WorksheetAssignment' => [
            'fields' => ['TermID', 'CourseSectionID', 'WorksheetID'],
            'unique' => true
        ]
    ];

    public static $dynamicFields = [
        'CourseSection',
        'Term',
        'Worksheet'
    ];

    public function save($deep = true)
    {
        if ($this->isPhantom && !$this->TermID && $this->CourseSection && $this->CourseSection->TermID) {
            $this->TermID = $this->CourseSection->TermID;
        }

        parent::save($deep);
    }
}