<?php

namespace Slate\Progress;

use Emergence\People\IPerson;
use Emergence\People\User;
use Slate\Term;


class Note extends \Emergence\CRM\Message implements IStudentReport
{
    use StudentReportTrait;


    public static $subjectFormat = '[PROGRESS NOTE] %s: %s';
    public static $archiveMailboxFormat = false;

    public static $cssTpl = 'notes/_css';
    public static $headerTpl = 'notes/_header';
    public static $bodyTpl = 'notes/_body';

    public static $summaryFields = [
        'ID' => true,
        'Class' => true,
        'Sent' => true,
        'ContextClass' => true,
        'ContextID' => true,
        'Context' => true,
        'AuthorID' => true,
        'Author' => true,
        'Subject' => true,
        'Status' => true
    ];

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

        if (!$this->Context || !$this->Context->isA(User::class)) {
            $this->_validator->addError('Context', 'Progress note must be in the context of a user');
        }

        // save results
        return $this->finishValidation();
    }

    public static function getNoun($count = 1)
    {
        return $count == 1 ? 'progress note' : 'progress notes';
    }

    public function getTerm()
    {
        return Term::getForDate($this->Created);
    }


    public function getTimestamp()
    {
        return $this->Sent;
    }

    public function getAuthor()
    {
        return $this->Author;
    }

    public function getStudent()
    {
        return $this->Context;
    }


    public static function getAllByStudent(IPerson $Student)
    {
        return static::getAllByWhere([
            'ContextClass' => $Student->getRootClass(),
            'ContextID' => $Student->ID
        ], ['order' => ['ID' => 'DESC']]);
    }

    public static function getAllByTerm(Term $Term)
    {
        return static::getAllByWhere([
            sprintf('Created BETWEEN "%s" AND "%S"', $Term->StartDate, $Term->EndDate)
        ], ['order' => ['ID' => 'DESC']]);
    }

    public static function getAllByStudentTerm(IPerson $Student, Term $Term)
    {
        return static::getAllByWhere([
            'ContextClass' => $Student->getRootClass(),
            'ContextID' => $Student->ID,
            sprintf('Created BETWEEN "%s" AND "%s"', $Term->StartDate, $Term->EndDate)
        ], ['order' => ['ID' => 'DESC']]);
    }

#    public static function getAllByTerm(Term $Term = null, array $parameters = [], $summarizeRecords = true)
#    {
#        $sql = 'SELECT %s FROM `%s` Note LEFT JOIN `%s` People ON (People.ID = Note.AuthorID) WHERE (%s) HAVING (%s)';
#
#        $having = [];
#
#        if ($summarizeRecords === true) {
#            $select = [
#                'Note.ID',
#                'Note.Class',
#                'Note.Subject',
#                'Sent AS Date',
#                'People.Username AS AuthorUsername'
#            ];
#        } else {
#            $select = ['Note.*'];
#        }
#
#        $queryParams = [
#            static::$tableName,
#            Person::$tableName
#        ];
#
#        $conditions = [
#            'ContextID' => $parameters['StudentID'],
#            'ContextClass' => Person::getStaticRootClass()
#        ];
#
#        if ($Term) {
#            $conditions[] = "DATE(Note.Created) BETWEEN '{$Term->StartDate}' AND '{$Term->EndDate}'";
#        }
#
#        if ($search) {
#            $matchedSearchConditions = static::getProgressSearchConditions('ProgressNote', $search);
#            $searchConditions = [];
#
#            if (!empty($matchedSearchConditions['qualifierConditions'])) {
#                foreach ($matchedSearchConditions['qualifierConditions'] as $qualifierConditions) {
#                    $conditionString = '( ('.implode(') OR (', $qualifierConditions).') )';
#
#                    if ($matchedSearchConditions['mode'] == 'OR') {
#                        $searchConditions = array_merge($searchConditions, $qualifierConditions);
#                    } else {
#                        $conditions[] = $conditionString;
#                    }
#                }
#            }
#
#            if ($matchedSearchConditions['mode'] == 'OR') {
#                $select[] = implode('+', array_map(function($c) {
#                    return sprintf('IF(%s, %u, 0)', $c, 1);
#                }, $searchConditions)).' AS searchScore';
#
#                $having[] = 'searchScore >= 1';
#            }
#        }
#
#        array_unshift($queryParams, implode(',', $select));
#        $queryParams[] = $conditions ? implode(' AND ', static::mapConditions($conditions)) : '1';
#        $queryParams[] = empty($having) ? '1' : join(' AND ', $having);
#        try {
#            if ($summarizeRecords === true) {
#                return DB::allRecords($sql, $queryParams);
#            } else {
##                \MICS::dump([$sql, $queryParams], 'query');
#                return static::getAllByQuery($sql, $queryParams);
#            }
#        } catch (\TableNotFoundException $e) {
#            return [];
#        }
#    }
}