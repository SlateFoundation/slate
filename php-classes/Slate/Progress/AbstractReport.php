<?php

namespace Slate\Progress;

use Slate\People\Student;


abstract class AbstractReport extends \VersionedRecord
{
    // ActiveRecord configuration
    public static $singularNoun = 'report';
    public static $pluralNoun = 'reports';
    public static $updateOnDuplicateKey = true;

    public static $fields = [
        'StudentID' => [
            'type' => 'uint',
            'index' => true
        ],
        'Status' => [
            'type' => 'enum',
            'values' => ['draft', 'published'],
            'default' => 'draft'
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
        'Student'
    ];
}