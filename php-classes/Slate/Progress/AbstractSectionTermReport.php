<?php

namespace Slate\Progress;

use Slate\Courses\Section;
use Slate\Courses\SectionTermData;
use Slate\Term;


abstract class AbstractSectionTermReport extends AbstractReport
{
    // ActiveRecord configuration
    public static $singularNoun = 'section term report';
    public static $pluralNoun = 'section term reports';

    public static $fields = [
        'SectionID' => [
            'type' => 'uint',
            'index' => true
        ],
        'TermID' => [
            'type' => 'uint',
            'index' => true
        ]
    ];

    public static $relationships = [
        'Section' => [
            'type' => 'one-one',
            'class' => Section::class
        ],
        'Term' => [
            'type' => 'one-one',
            'class' => Term::class
        ],
        'SectionTermData' => [
            'type' => 'one-one',
            'class' => SectionTermData::class,
            'link' => ['TermID', 'SectionID']
        ]
    ];

    public static $searchConditions = [
        'SectionID' => [
            'qualifiers' => ['narrative-id'],
            'points' => 2,
            'sql' => 'ID=%u'
        ],
        'TermID' => [
            'qualifiers' => ['term-id'],
            'points' => 2,
            'sql' => 'TermID=%u'
        ]
    ];

    public static $dynamicFields = [
        'Section',
        'Term',
        'SectionTermData'
    ];
}