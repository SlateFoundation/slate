<?php

namespace Slate\Progress;

use Slate\Progress\SectionData;

class SectionTermReport extends AbstractSectionTermReport
{
    public static $tableName = 'section_term_reports';
    public static $singularNoun = 'section term report';
    public static $pluralNoun = 'section term reports';
    public static $collectionRoute = '/progress/terms/reports';

    public static $printTemplate = 'print';

    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    public static $fields = [
        'Notes' => [
            'type' => 'clob',
            'default' => null
        ],
        'NotesFormat' => [
            'type' => 'enum',
            'values' => ['markdown', 'html'],
            'default' => 'markdown'
        ]
    ];

    public static $relationships = [
        'SectionData' => [
            'type' => 'one-one',
            'class' => SectionTermData::class,
            'link' => ['TermID', 'SectionID']
        ]
    ];

    public static $indexes = [
        'StudentSectionTerm' => [
            'fields' => ['StudentID', 'SectionID', 'TermID'],
            'unique' => true
        ]
    ];
}