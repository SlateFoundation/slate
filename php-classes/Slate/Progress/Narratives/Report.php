<?php

namespace Slate\Progress\Narratives;

use DuplicateKeyException;

class Report extends \VersionedRecord
{
    // VersionedRecord configuration
    public static $historyTable = 'history_narrative_reports';

    // ActiveRecord configuration
    public static $tableName = 'narrative_reports';
    public static $singularNoun = 'narrative report';
    public static $pluralNoun = 'narrative reports';
    public static $updateOnDuplicateKey = true;
    public static $trackModified = true;

    // required for shared-table subclassing support
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    public static $fields = [
        'StudentID' => [
            'type' => 'integer',
            'unsigned' => true
        ],
        'CourseSectionID' => [
            'type' => 'integer',
            'unsigned' => true
        ],
        'TermID' => [
            'type' => 'integer',
            'unsigned' => true
        ],

        'Status' => [
            'type' => 'enum',
            'values' => ['Draft','Published'],
            'default' => 'Draft'
        ],
        'Updated' => [
            'type' => 'timestamp'
            ,'notnull' => false
        ],
        'Notes' => [
            'type' => 'clob',
            'notnull' => false
        ]
    ];


    public static $indexes = [
        'NarrativeReport' => [
            'fields' => ['StudentID', 'CourseSectionID', 'TermID'],
            'unique' => true
        ]
    ];

    public static $relationships = [
        'Section' => [
            'type' => 'one-one',
            'class' => \Slate\Courses\Section::class,
            'local' => 'CourseSectionID'
        ],
        'Student' => [
            'type' => 'one-one',
            'class' => \Slate\People\Student::class
        ],
        'Term' => [
            'type' => 'one-one',
            'class' => \Slate\Term::class
        ]
    ];

#    public function validate($deep = true)
#    {
#        // call parent
#        parent::validate($deep);
#
#        $this->_validator->validate([
#            'field' => 'Grade',
#            'validator' => 'selection',
#            'choices' => static::getFieldOptions('Grade', 'values'),
#            'required' => ($this->Status=='Published'),
#            'errorMessage' => 'Grade is require before publishing'
#        ]);
#
#        // save results
#        return $this->finishValidation();
#    }
}