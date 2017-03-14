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
    
    public static function getStylesheet()
    {
        return \Site::resolvePath('site-root/css/reports/progress.css')->RealPath;
    }
    
    public function getHeader()
    {
        $html = 
            "<header>".
            	($this->Student->Advisor ?
        				"<div class=\"advisor\">".
        					"Advisor: {$Report->Student->Advisor->FullName}".
        					"<a href=\"mailto:{$this->Student->Advisor->Email}\">{$this->Student->Advisor->Email}</a>".
        				"</div>"
                    : '').
    		    "<h1>".
    				"<span class=\"pretitle\">".$this->getType()." report for</span>".
    				"{$this->Student->FullName}".
    			"</h1>".
    			$this->getRecordHeader();
    		"</header>";
        
        return $html;
    }
    
    public function getTermHeader()
    {
        return "<h3 class=\"term\">".
            htmlspecialchars($this->Term->Title, ENT_QUOTES).
        "</h3>";
    }
    
    public function getRecordHeader()
    {
        return $this->getTermHeader();
    }
    
    public function getReportHeader()
    {
        return $this->getHeader();
    }
    
    public function getBody()
    {
        $html = 
            "<article class=\"report\">".
                "<h2>".
                    htmlspecialchars($this->Section->Title, ENT_QUOTES).
                "</h2>";
    
        $html .= "<dl>";
        
        if (count($this->Section->Teachers)) {
            $html .= 
                "<dt class=\"instructor\">".
                    "Teacher".
                    (count($this->Section->Teachers) != 1 ? 's' : '').
                "</dt>";
                    
            foreach ($this->Section->Teachers as $Teacher) {
                $escapedName = htmlspecialchars($Teacher->FullName, ENT_QUOTES);
                $escapedEmail = htmlspecialchars($Teacher->PrimaryEmail, ENT_QUOTES);
                
                $html .= 
                    "<dd class=\"instructor\">". 
                        $escapedName.
                        ($Teacher->Email ? " &lt;<a href=\"mailto:".$escapedEmail."\">".$escapedEmail."</a>&gt;" : '').
                    "</dd><br />";
            }
            
        }
        


        if ($this->Grade) {
            $html .= 
                "<dt class=\"grade\">Current Grade</dt>".
                "<dd class=\"grade\">{$this->Grade}</dd>";
        }
        
        if ($this->SectionTermData && trim($this->SectionTermData->getValue($this->getType().'ReportNotes'))) {
            $html .=            
                "<dt class=\"comments\">Section Notes</dt>".
                "<dd class=\"comments\">".
                    \Michelf\SmartyPantsTypographer::defaultTransform(
                        \Michelf\MarkdownExtra::defaultTransform(
                            htmlspecialchars($this->SectionTermData->getValue($this->getType().'ReportNotes'), ENT_QUOTES)
                        )
                    ).
                "</dd>";
        }
                
        if ($this->Notes) {
            $html .=
                "<dt class=\"comments\">Comments</dt>".
                "<dd class=\"comments\">";
                
            switch ($this->NotesFormat) {
                case 'html':
                    $html .= $this->Notes;
                    break;
                
                case 'markdown':
                    $html .= \Michelf\SmartyPantsTypographer::defaultTransform(
                        \Michelf\MarkdownExtra::defaultTransform(
                            htmlspecialchars($this->Notes, ENT_QUOTES)
                        )
                    );
                    break;
                    
                default:
                    $html .= htmlspecialchars($this->Notes, ENT_QUOTES);
            }
            
            $html .= "</dd>";
        }
                
        $html .= 
            "</dl>".
            "</article>";
            
        return $html;
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