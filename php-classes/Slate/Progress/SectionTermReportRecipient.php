<?php

namespace Slate\Progress;

use Emergence\People\ContactPoint\Email;
use Slate\People\Student;
use Slate\Term;

class SectionTermReportRecipient extends \ActiveRecord
{
    public static $tableName = 'section_term_report_recipients';
    public static $singularNoun = 'section term report recipient';
    public static $pluralNoun = 'section term report recipients';
    public static $updateOnDuplicateKey = true;

    public static $fields = [
        'StudentID' => 'uint',
        'TermID' => 'uint',
        'EmailContactID' => 'uint',
        'Status' => [
            'type' => 'enum',
            'values' => ['pending', 'sent', 'bounced'],
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
        'SectionTermReportRecipient' => [
            'fields' => ['StudentID', 'TermID', 'EmailContactID'],
            'unique' => true
        ]
    ];
}
