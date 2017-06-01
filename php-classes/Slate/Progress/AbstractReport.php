<?php

namespace Slate\Progress;

use Slate\People\Student;


abstract class AbstractReport extends \VersionedRecord implements IStudentReport
{
    use StudentReportTrait;


    public static $cssTpl;
    public static $headerTpl = '_header';
    public static $bodyTpl = '_body';

    // ActiveRecord configuration
    public static $singularNoun = 'report';
    public static $pluralNoun = 'reports';
    public static $updateOnDuplicateKey = true;

    public static $summaryFields = [
        'ID' => true,
        'Class' => true,
        'Created' => true,
        'CreatorID' => true,
        'Creator' => true,
        'StudentID' => true,
        'Student' => true,
        'Status' => true
    ];

    public static $fields = [
        'StudentID' => [
            'type' => 'uint',
            'index' => true,
            'includeInSummary' => true
        ],
        'Status' => [
            'type' => 'enum',
            'values' => ['draft', 'published'],
            'default' => 'draft',
            'includeInSummary' => true
        ],
    ];

    public static $relationships = [
        'Student' => [
            'type' => 'one-one',
            'class' => Student::class
        ]
    ];

    public static $searchConditions = [
        'StudentID' => [
            'qualifiers' => ['student-id'],
            'points' => 2,
            'sql' => 'StudentID=%u'
        ]
    ];

    public static $dynamicFields = [
        'Student' => [
            'includeInSummary' => true
        ]
    ];
}