<?php

namespace Slate\Progress\Narratives;

class Report extends \VersionedRecord
{
    // VersionedRecord configuration
    public static $historyTable = 'history_narrative_reports';

    // ActiveRecord configuration
    public static $tableName = 'narrative_reports';
    public static $singularNoun = 'narrative report';
    public static $pluralNoun = 'narrative reports';
    public static $collectionRoute = '/progress/narratives/reports';
    public static $updateOnDuplicateKey = true;
    public static $trackModified = true;

    // required for shared-table subclassing support
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    public static $fields = [
        'TermID' => [
            'type' => 'integer',
            'unsigned' => true
        ],
        'CourseSectionID' => [
            'type' => 'integer',
            'unsigned' => true
        ],
        'StudentID' => [
            'type' => 'integer',
            'unsigned' => true
        ],

        'Status' => [
            'type' => 'enum',
            'values' => ['draft', 'published'],
            'default' => 'draft'
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
            'fields' => ['TermID', 'CourseSectionID', 'StudentID'],
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
}