<?php

namespace Slate\Progress;

use DB;
use Emergence\People\Person;

use Slate\Courses\Section;
use Slate\Courses\SectionTermData;
use Slate\Term;


abstract class AbstractSectionTermReport extends AbstractReport implements IStudentTermReport
{
    use StudentTermReportTrait;


    // ActiveRecord configuration
    public static $singularNoun = 'section term report';
    public static $pluralNoun = 'section term reports';

    public static $summaryFields = [
        'SectionID' => true,
        'Section' => true,
        'TermID' => true,
        'Term' => true
    ];

    public static $fields = [
        'SectionID' => [
            'type' => 'uint',
            'index' => true,
            'includeInSummary' => true
        ],
        'TermID' => [
            'type' => 'uint',
            'index' => true,
            'includeInSummary' => true
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
        'Section' => [
            'includeInSummary' => true
        ],
        'Term' => [
            'includeInSummary' => true
        ],
        'SectionTermData'
    ];

#    public static function getAllByTerm(Term $Term = null, array $conditions = [], $summarizeRecords = true)
#    {
#        if ($Term) {
#            $conditions['TermID'] = $Term->ID;
#        }
#
#        $tableAlias = static::getTableAlias();
#        $query = 'SELECT %s FROM `%s` %s %s WHERE (%s)';
#
#        if ($summarizeRecords === true) {
#            $select = [
#                $tableAlias.'.ID',
#                $tableAlias.'.Notes',
#                $tableAlias.'.CreatorID',
#                $tableAlias.'.Class',
#                $tableAlias.'.Created as Date',
#                'CONCAT(Author.FirstName, " ", Author.LastName) as AuthorFullName',
#                'AuthorEmail.Data as AuthorEmail',
#                'CONCAT(Student.FirstName, " ", Student.LastName) AS StudentFullName'
#            ];
#        } else {
#            $select = [
#                $tableAlias.'.*'
#            ];
#        }
#
#        $join = [
#            sprintf('LEFT JOIN `%s` Student ON Student.ID = %s.StudentID', Person::$tableName, $tableAlias),
#            sprintf('LEFT JOIN `%s` Author ON Author.ID = %s.CreatorID', Person::$tableName, $tableAlias),
#            sprintf('LEFT JOIN `%s` AuthorEmail ON AuthorEmail.ID = Author.PrimaryEmailID', \Emergence\People\ContactPoint\Email::$tableName)
#        ];
#
#        $queryParams = [
#            static::$tableName,
#            $tableAlias,
#            join(" ", $join)
#        ];
#
#        array_unshift($queryParams, implode(',', $select));
#
#        $queryParams[] = $conditions ? implode(' AND ', static::mapConditions($conditions)) : '1';
#
#        try {
#            if ($summarizeRecords === true) {
#                return DB::allRecords($query, $queryParams);
#            } else {
#                return static::getAllByQuery($query, $queryParams);
#            }
#        } catch (\TableNotFoundException $e) {
#            return [];
#        }
#    }
}