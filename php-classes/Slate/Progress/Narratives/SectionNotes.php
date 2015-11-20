<?php

namespace Slate\Progress\Narratives;

class SectionNotes extends \VersionedRecord
{
    // VersionedRecord configuration
    public static $historyTable = 'history_narrative_section_notes';

    // ActiveRecord configuration
    public static $tableName = 'narrative_section_notes';
    public static $singularNoun = 'narrative section note';
    public static $pluralNoun = 'narrative section notes';
    public static $collectionRoute = '/progress/narratives/section-notes';
    public static $updateOnDuplicateKey = true;
    public static $trackModified = true;

    public static $fields = [
        'CourseSectionID' => [
            'type' => 'integer',
            'unsigned' => true
        ],
        'TermID' => [
            'type' => 'integer',
            'unsigned' => true
        ],
        'Notes' => [
            'type' => 'clob',
            'notnull' => false
        ]
    ];


    public static $indexes = [
        'NarrativeSectionNote' => [
            'fields' => ['TermID', 'CourseSectionID'],
            'unique' => true
        ]
    ];

    public static $relationships = [
        'Section' => [
            'type' => 'one-one',
            'class' => \Slate\Courses\Section::class,
            'local' => 'CourseSectionID'
        ],
        'Term' => [
            'type' => 'one-one',
            'class' => \Slate\Term::class
        ]
    ];
}