<?php

namespace Slate\Progress;

use DB;
use Emergence\People\Person;
use Slate\Term;

class Note extends \Emergence\CRM\Message implements IStudentTermReport
{
    public static $subjectFormat = '[PROGRESS NOTE] %s: %s';
    public static $archiveMailboxFormat = false;

    public static $bodyTpl = 'notes/note.body';
    public static $headerTpl = 'notes/note.header';
    public static $cssTpl = 'notes/note.css';

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
    
    public function getTerm()
    {
        return Term::getForDate($this->Created);
    }
    
    public function getAuthor()
    {
        return $this->Author;
    }
    
    public function getStudent()
    {
        return $this->Context;
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
        return \Emergence\Dwoo\Engine::getSource(static::$bodyTpl, ['Note' => $this]);
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