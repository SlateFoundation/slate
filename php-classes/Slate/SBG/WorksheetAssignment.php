<?php

namespace Slate\SBG;

use Slate\Term;
use Slate\Courses\Section;

class WorksheetAssignment extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'sbg_worksheet_assignments';
    public static $singularNoun = 'standards worksheet assignment';
    public static $pluralNoun = 'standards worksheet assignments';
    public static $collectionRoute = '/sbg/worksheet-assignments';
    public static $updateOnDuplicateKey = true;

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
            'fields' => ['TermID', 'CourseSectionID'],
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