<?php

namespace Slate\Progress;

use Slate\Term;
use Slate\Courses\Section;
use Slate\People\Student;

use DB;
use Emergence\People\Person;
use Emergence\People\PeopleRequestHandler;


class SectionInterimReportsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = SectionInterimReport::class;
    public static $accountLevelBrowse = 'Staff';
	public static $accountLevelRead = 'Staff';
	public static $accountLevelWrite = 'Staff';
	public static $accountLevelAPI = 'Staff';


    public static function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case '*authors':
                return static::handleAuthorsRequest();
            case '*emails':
                return static::handleEmailsRequest();
            case '*email-preview':
                return static::handleEmailPreviewRequest();
            default:
                return parent::handleRecordsRequest($action);
        }
    }

    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        if (!empty($_REQUEST['term'])) {
            if ($_REQUEST['term'] == 'current') {
                if (!$Term = Term::getClosest()) {
                    return static::throwInvalidRequestError('No current term could be found');
                }
            } elseif (!$Term = Term::getByHandle($_REQUEST['term'])) {
                return static::throwNotFoundError('term not found');
            }

            $conditions[] = sprintf('TermID IN (%s)', join(',', $Term->getRelatedTermIDs()));
            $responseData['term'] = $Term;
        }

        if (!empty($_REQUEST['course_section'])) {
            if (!$Section = Section::getByHandle($_REQUEST['course_section'])) {
                return static::throwNotFoundError('course_section not found');
            }

            $conditions['SectionID'] = $Section->ID;
            $responseData['course_section'] = $Section;
        }

        if (!empty($_REQUEST['students'])) {
            $studentIds = [];

            foreach (Student::getAllByListIdentifier($_REQUEST['students']) AS $Student) {
                $studentIds[] = $Student->ID;
            }

            $conditions[] = sprintf('StudentID IN (%s)', count($studentIds) ? join(',', $studentIds) : '0');
        }

        if (!empty($_REQUEST['status'])) {
            if (!in_array($_REQUEST['status'], Report::getFieldOptions('Status', 'values'))) {
                return static::throwInvalidRequestError('Invalid status');
            }

            $conditions['Status'] = $_REQUEST['status'];
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }

    public static function handleAuthorsRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');

        return static::respond('authors', [
            'data' => Person::getAllByQuery(
                'SELECT DISTINCT Person.* FROM `%s` Report JOIN `%s` Person ON Person.ID = Report.CreatorID',
                [
                    SectionInterimReport::$tableName,
                    Person::$tableName
                ]
            )
        ]);
    }

    public static function handleEmailsRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');


        $conditions = [
            'Status' => 'published'
        ];

        if (empty($_REQUEST['recipients'])) {
            $recipients = [];
        } elseif (is_array($_REQUEST['recipients'])) {
            $recipients = $_REQUEST['recipients'];
        } else {
            $recipients = explode(',', $_REQUEST['recipients']);
        }


        // always filter by term
        if (!empty($_REQUEST['term'])) {
            if (!$Term = Term::getByHandle($_REQUEST['term'])) {
                return static::throwNotFoundError('term not found');
            }
        } else {
            $Term = Term::getClosest();
        }

        $conditions['TermID'] = $Term->ID;


        // optionally filter by advisor
        if (!empty($_REQUEST['advisor'])) {
            if (!$Advisor = PeopleRequestHandler::getRecordByHandle($_REQUEST['advisor'])) {
                return static::throwNotFoundError('advisor not found');
            }

            $advisorStudentIds = DB::allValues(
                'ID',
                'SELECT ID FROM `%s` WHERE AdvisorID = %u',
                [
                    Person::$tableName,
                    $Advisor->ID
                ]
            );

            $conditions[] = 'StudentID IN ('.(count($advisorStudentIds) ? implode(',', $advisorStudentIds) : 'NULL').')';
        }


        // optionally filter by author
        if (!empty($_REQUEST['author'])) {
            if (!$Author = PeopleRequestHandler::getRecordByHandle($_REQUEST['author'])) {
                return static::throwNotFoundError('author not found');
            }

            $conditions['CreatorID'] = $Author->ID;
        }


        // optionally filter by student
        if (!empty($_REQUEST['student'])) {
            if (!$Student = PeopleRequestHandler::getRecordByHandle($_REQUEST['student'])) {
                return static::throwNotFoundError('student not found');
            }

            $conditions['StudentID'] = $Student->ID;
        }


        // fetch all interims
        $interims = SectionInterimReport::getAllByWhere($conditions);


        // group interims by student
        $students = [];
        foreach ($interims AS $Interim) {
            if (!isset($students[$Interim->StudentID])) {
                $students[$Interim->StudentID] = [
                    'student' => $Interim->Student,
                    'recipients' => [],
                    'reports' => []
                ];
            }

            $students[$Interim->StudentID]['reports'][] = $Interim->ID;
        }


        // collect recipients
        foreach ($students AS &$student) {
            if (in_array('advisor', $recipients)) {
                $student['recipients'][] = $student['student']->Advisor->EmailRecipient;
            }

            if (in_array('guardians', $recipients)) {
                foreach ($student['student']->Guardians AS $Guardian) {
                    $student['recipients'][] = $Guardian->EmailRecipient;
                }
            }

            // clear out any contacts with email unavailable
            $student['recipients'] = array_values(array_filter($student['recipients']));
        }

        return static::respond('emails', [
            'data' => array_values($students),
            'term' => $Term,
            'advisor' => $Advisor,
            'author' => $Author,
            'student' => $Student
        ]);
    }
    
    public static function handleEmailPreviewRequest()
    {
        if (empty($_REQUEST['reports'])) {
            $reportIds = [];
        } elseif (is_array($_REQUEST['reports'])) {
            $reportIds = $_REQUEST['reports'];
        } else {
            $reportIds = explode(',', $_REQUEST['reports']);
        }

        $reportIds = array_filter($reportIds, 'is_numeric');

        if (!count($reportIds)) {
            die('No reports specified');
        }


        // fetch all report instances
        $interims = SectionInterimReport::getAllByWhere('ID IN ('.implode(',', $reportIds).')');


        // collect terms and students
        $terms = [];
        $students = [];

        foreach ($interims AS $Interim) {
            if (!in_array($Interim->Term, $terms)) {
                $terms[] = $Interim->Term;
            }

            if (!in_array($Interim->Student, $students)) {
                $students[] = $Interim->Student;
            }
        }


        return static::respond('email', [
            'data' => $interims,
            'terms' => $terms,
            'students' => $students
        ]);
    }
}