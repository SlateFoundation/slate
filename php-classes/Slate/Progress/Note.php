<?php

namespace Slate\Progress;

use DB;
use Emergence\People\Person;
use Slate\Term;

class Note extends \Emergence\CRM\Message implements IStudentTermReport
{
    public static $subjectFormat = '[PROGRESS NOTE] %s: %s';
    public static $archiveMailboxFormat = false;

    public static $pdfTemplate = 'notes/print';

    public function getEmailRecipientsList($recipients = false)
    {
        $recipients = parent::getEmailRecipientsList($recipients);

        if (static::$archiveMailboxFormat) {
            array_unshift($recipients, sprintf(static::$archiveMailboxFormat, $this->Context->Username));
        }

        return $recipients;
    }

    public function getEmailSubject()
    {
        return sprintf(static::$subjectFormat, $this->Context->FullName, $this->Subject);
    }

    //TODO: migrate to $validators ?
    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        if (!$this->Context || !$this->Context->isA(\Emergence\People\User::class)) {
            $this->_validator->addError('Context', 'Progress note must be in the context of a user');
        }

        // save results
        return $this->finishValidation();
    }
    
    public static function getType()
    {
        return 'Progress';
    }
    
    public static function getStylesheet()
    {
        return \Site::resolvePath('site-root/css/reports/print.css')->RealPath;
    }
    
    public function getTerm()
    {
        return Term::getByQuery(
            'SELECT Term.* '.
            '  FROM `%s` Term '.
            ' WHERE DATE("%s") BETWEEN Term.StartDate AND Term.EndDate '.
            ' ORDER BY Term.Right - Term.Left',
            [
                Term::$tableName,
                $this->Created,
                
            ]
        );
    }
    
    public function getAuthor()
    {
        return $this->Author;
    }
    
    public function getStudent()
    {
        return $this->Context;
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
    				"<span class=\"pretitle\">".$this->getType()." notes for</span>".
    				"{$this->Student->FullName}".
    			"</h1>".
    			$this->getRecordHeader();
    		"</header>";
        
        return $html;
    }
    
    public function getTermHeader()
    {
        return "<h3 class=\"term\">".
            htmlspecialchars($this->getTerm()->Title, ENT_QUOTES).
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
            "<article class=\"doc-item\">".
    				"<header class=\"doc-header\">".
						"<h3 class=\"item-title\">{$this->Subject}</h3>".
						"<div class=\"meta\">".
							"<span class=\"item-creator\">".
								"{$this->getAuthor()->FullName}".
                                ($this->getAuthor()->PrimaryEmail ? "&lt;<a class=\"url\" href=\"mailto:{$this->getAuthor()->PrimaryEmail}\">{$this->getAuthor()->PrimaryEmail}</a>&gt;" : '').
							"</span>".
							"<time class=\"item-datetime\">". date('M j, Y', $this->Created). "</time>".
						"</div>".
					"</header>";
                    
        if ($this->MessageFormat == 'html') {
            $html .= "<div class=\"item-body\">{$this->Message}</div>"; 
        } else {
            $html .= "<div class=\"item-body\">".htmlspecialchars($this->Message, ENT_QUOTES)."</div>";
        }
					
		$html .= "</article>";
        
        return $html;
    }
    
    public static function getAllByTerm(Term $Term = null, array $parameters = [], $summarizeRecords = true)
    {
        $sql = 'SELECT %s FROM `%s` Note LEFT JOIN `%s` People ON (People.ID = Note.AuthorID) WHERE (%s) HAVING (%s)';

        $having = [];
        
        if ($summarizeRecords === true) {
            $select = [
                'Note.ID',
                'Note.Class',
                'Note.Subject',
                'Sent AS Date',
                'People.Username AS AuthorUsername'
            ];
        } else {
            $select = ['Note.*'];
        }

        $queryParams = [
            static::$tableName,
            Person::$tableName
        ];
        
        $conditions = [
            'ContextID' => $parameters['StudentID'],
            'ContextClass' => Person::getStaticRootClass()
        ];

        if ($Term) {
            $conditions[] = "DATE(Note.Created) BETWEEN '{$Term->StartDate}' AND '{$Term->EndDate}'";
        }        

        if ($search) {
            $matchedSearchConditions = static::getProgressSearchConditions('ProgressNote', $search);
            $searchConditions = [];

            if (!empty($matchedSearchConditions['qualifierConditions'])) {
                foreach ($matchedSearchConditions['qualifierConditions'] as $qualifierConditions) {
                    $conditionString = '( ('.implode(') OR (', $qualifierConditions).') )';

                    if ($matchedSearchConditions['mode'] == 'OR') {
                        $searchConditions = array_merge($searchConditions, $qualifierConditions);
                    } else {
                        $conditions[] = $conditionString;
                    }
                }
            }

            if ($matchedSearchConditions['mode'] == 'OR') {
                $select[] = implode('+', array_map(function($c) {
                    return sprintf('IF(%s, %u, 0)', $c, 1);
                }, $searchConditions)).' AS searchScore';

                $having[] = 'searchScore >= 1';
            }
        }

        array_unshift($queryParams, implode(',', $select));
        $queryParams[] = $conditions ? implode(' AND ', static::mapConditions($conditions)) : '1';
        $queryParams[] = empty($having) ? '1' : join(' AND ', $having);
        try {
            if ($summarizeRecords === true) {
                return DB::allRecords($sql, $queryParams);
            } else {
#                \MICS::dump([$sql, $queryParams], 'query');
                return static::getAllByQuery($sql, $queryParams);
            }
        } catch (\TableNotFoundException $e) {
            return [];
        }
    }
}