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
    
    public static function __classLoaded()
    {
        if (isset(static::$collectionRoute)) {
            $tplPath =  ltrim(static::$collectionRoute, '/') . '/section'.static::getType().'Report';
            if (empty(static::$bodyTpl)) {
                static::$bodyTpl = $tplPath.'.body';
            }
            
            if (empty(static::$headerTpl)) {
                static::$headerTpl = $tplPath.'.header';
            }
            
            if (empty(static::$cssTpl)) {
                static::$cssTpl = $tplPath.'.css';
            }
        }
    }
    
    public static function getCSS()
    {
        return \Emergence\Dwoo\Engine::getSource(static::$cssTpl);
    }
    
    public function getHeaderHTML()
    {
        return \Emergence\Dwoo\Engine::getSource(static::$headerTpl, ['Report' => $this]);
    }
    
    public function getBodyHTML()
    {
        return \Emergence\Dwoo\Engine::getSource(static::$bodyTpl, ['Report' => $this]);
    }
    
    public static function getAllByTerm(Term $Term = null, array $conditions = [], $summarizeRecords = true)
    {
        if ($Term) {
            $conditions['TermID'] = $Term->ID;
        }

        $tableAlias = static::getTableAlias();
        $query = 'SELECT %s FROM `%s` %s %s WHERE (%s)';

        if ($summarizeRecords === true) {
            $select = [
                $tableAlias.'.ID',
                $tableAlias.'.Notes',
                $tableAlias.'.CreatorID',
                $tableAlias.'.Class',
                $tableAlias.'.Created as Date',
                'CONCAT(Author.FirstName, " ", Author.LastName) as AuthorFullName',
                'AuthorEmail.Data as AuthorEmail',
                'CONCAT(Student.FirstName, " ", Student.LastName) AS StudentFullName'
            ];
        } else {
            $select = [
                $tableAlias.'.*'    
            ];
        }

        $join = [
            sprintf('LEFT JOIN `%s` Student ON Student.ID = %s.StudentID', Person::$tableName, $tableAlias),
            sprintf('LEFT JOIN `%s` Author ON Author.ID = %s.CreatorID', Person::$tableName, $tableAlias),
            sprintf('LEFT JOIN `%s` AuthorEmail ON AuthorEmail.ID = Author.PrimaryEmailID', \Emergence\People\ContactPoint\Email::$tableName)
        ];

        $queryParams = [
            static::$tableName,
            $tableAlias,
            join(" ", $join)
        ];

        array_unshift($queryParams, implode(',', $select));

        $queryParams[] = $conditions ? implode(' AND ', static::mapConditions($conditions)) : '1';

        try {
            if ($summarizeRecords === true) {
                return DB::allRecords($query, $queryParams);
            } else {
                return static::getAllByQuery($query, $queryParams);
            }
        } catch (\TableNotFoundException $e) {
            return [];
        }
    }
    
}