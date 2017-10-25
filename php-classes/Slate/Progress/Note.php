<?php

namespace Slate\Progress;

use Emergence\People\IPerson;
use Emergence\People\User;
use Slate\Term;


class Note extends \Emergence\CRM\Message implements IStudentTermReport
{
    use StudentReportTrait;


    public static $subjectFormat = '[PROGRESS NOTE] %s: %s';
    public static $archiveMailboxFormat = false;

    public static $cssTpl = 'notes/_css';
    public static $bodyTpl = 'notes/_body';

    public static $summaryFields = [
        'ID' => true,
        'Class' => true,
        'Noun' => true,
        'Timestamp' => true,
        'Author' => true,
        'Student' => true,
        'Title' => true,
        'Status' => true,
        'Term' => true
    ];

    public static $dynamicFields = [
        'Noun' => [
            'getter' => 'getNoun'
        ],
        'Timestamp' => [
            'getter' => 'getTimestamp'
        ],
        'Author' => [
            'getter' => 'getAuthor'
        ],
        'Student' => [
            'getter' => 'getStudent'
        ],
        'Title' => [
            'getter' => 'getTitle'
        ],
        'Status' => [
            'getter' => 'getStatus'
        ],
        'Term' => [
            'getter' => 'getTerm'
        ]
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
        return $this->Sent ?: $this->Modified ?: $this->Created;
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
        $User = static::getUserFromEnvironment();

        return static::getAllByWhere([
            'ContextClass' => $Student->getRootClass(),
            'ContextID' => $Student->ID,
            'Status != "deleted"',
            'Status != "draft-private" OR AuthorID = '.($User ? $User->ID : 0)
        ], ['order' => ['ID' => 'DESC']]);
    }

    public static function getAllByTerm(Term $Term)
    {
        $User = static::getUserFromEnvironment();

        return static::getAllByWhere([
            sprintf('Created BETWEEN "%s" AND "%S"', $Term->StartDate, $Term->EndDate),
            'Status != "deleted"',
            'Status != "draft-private" OR AuthorID = '.($User ? $User->ID : 0)
        ], ['order' => ['ID' => 'DESC']]);
    }

    public static function getAllByStudentTerm(IPerson $Student, Term $Term)
    {
        $User = static::getUserFromEnvironment();

        return static::getAllByWhere([
            'ContextClass' => $Student->getRootClass(),
            'ContextID' => $Student->ID,
            sprintf('Created BETWEEN "%s" AND "%s"', $Term->StartDate, $Term->EndDate),
            'Status != "deleted"',
            'Status != "draft-private" OR AuthorID = '.($User ? $User->ID : 0)
        ], ['order' => ['ID' => 'DESC']]);
    }
}