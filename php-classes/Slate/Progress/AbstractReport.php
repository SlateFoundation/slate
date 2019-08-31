<?php

namespace Slate\Progress;

use Slate\People\Student;


abstract class AbstractReport extends \VersionedRecord implements IStudentReport
{
    use StudentReportTrait;


    public static $cssTpl;
    public static $bodyTpl = '_body';

    // ActiveRecord configuration
    public static $singularNoun = 'report';
    public static $pluralNoun = 'reports';
    public static $updateOnDuplicateKey = true;

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

    public static $summaryFields = [
        'ID' => true,
        'Class' => true,
        'Noun' => true,
        'Timestamp' => true,
        'Author' => true,
        'Student' => true,
        'Title' => true,
        'Status' => true
    ];

    public static $dynamicFields = [
        'Noun' => [
            'getter' => 'getNoun'
        ],
        'Timestamp' => [
            'getter' => 'getTimestamp'
        ],
        'Author' => [
            'getter' => 'getAuthor'
        ],
        'Student' => [
            'getter' => 'getStudent'
        ],
        'Title' => [
            'getter' => 'getTitle'
        ],
        'Status' => [
            'getter' => 'getStatus'
        ]
    ];

    public function getTitle()
    {
        return sprintf('%s #%u', $this->getNoun(), $this->ID);
    }
}