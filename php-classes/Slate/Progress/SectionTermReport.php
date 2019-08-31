<?php

namespace Slate\Progress;


class SectionTermReport extends AbstractSectionTermReport
{
    public static $cssTpl = 'section-term-reports/_css';
    public static $bodyTpl = 'section-term-reports/_body';


    public static $tableName = 'section_term_reports';
    public static $singularNoun = 'section term report';
    public static $pluralNoun = 'section term reports';
    public static $collectionRoute = '/progress/section-term-reports';

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

    public static $indexes = [
        'StudentSectionTerm' => [
            'fields' => ['StudentID', 'SectionID', 'TermID'],
            'unique' => true
        ]
    ];

    public static function getNoun($count = 1)
    {
        return $count == 1 ? 'term report' : 'term reports';
    }

    public function getTimestamp()
    {
        return strtotime($this->getTerm()->EndDate);
    }
}