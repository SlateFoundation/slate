<?php

namespace Slate\Courses;

class SectionTermData extends \VersionedRecord
{
    // VersionedRecord configuration
    public static $historyTable = 'history_section_term_data';

    // ActiveRecord configuration
    public static $tableName = 'section_term_data';
    public static $singularNoun = 'section term datum';
    public static $pluralNoun = 'section term notes';
    public static $collectionRoute = '/section-data';
    public static $updateOnDuplicateKey = true;
    public static $trackModified = true;

    public static $fields = [
        'SectionID' => [
            'type' => 'integer',
            'unsigned' => true
        ],
        'TermID' => [
            'type' => 'integer',
            'unsigned' => true
        ],
        'TermReportNotes' => [
            'type' => 'clob',
            'default' => null
        ],
        'InterimReportNotes' => [
            'type' => 'clob',
            'default' => null
        ]
    ];


    public static $indexes = [
        'SectionTermData' => [
            'fields' => ['TermID', 'SectionID'],
            'unique' => true
        ]
    ];

    public static $relationships = [
        'Section' => [
            'type' => 'one-one',
            'class' => Section::class
        ],
        'Term' => [
            'type' => 'one-one',
            'class' => \Slate\Term::class
        ]
    ];
}