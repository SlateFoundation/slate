<?php

namespace Slate\Progress;

use Emergence\People\ContactPoint\Email;
use Slate\People\Student;
use Slate\Term;

class SectionInterimReportRecipient extends \ActiveRecord
{
    public static $tableName = 'section_interim_report_recipients';
    public static $singularNoun = 'section interim report recipient';
    public static $pluralNoun = 'section interim report recipients';
    public static $updateOnDuplicateKey = true;

    public static $fields = [
        'StudentID' => 'uint',
        'TermID' => 'uint',
        'EmailContactID' => 'uint',
        'Status' => [
            'type' => 'enum',
            'values' => ['failed', 'pending', 'sent', 'bounced'],
            'default' => 'pending'
        ]
    ];

    public static $relationships = [
        'Student' => [
            'type' => 'one-one',
            'class' => Student::class
        ],
        'Term' => [
            'type' => 'one-one',
            'class' => Term::class
        ],
        'EmailContact' => [
            'type' => 'one-one',
            'class' => Email::class
        ]
    ];

    public static $dynamicFields = [
        'Student',
        'Term',
        'EmailContact'
    ];

    public static $indexes = [
        'SectionInterimReportRecipient' => [
            'fields' => ['StudentID', 'TermID', 'EmailContactID'],
            'unique' => true
        ]
    ];
}
