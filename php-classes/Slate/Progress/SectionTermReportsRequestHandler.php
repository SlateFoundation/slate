<?php

namespace Slate\Progress;

use Slate;
use Slate\Term;
use Slate\Courses\Section;
use Slate\People\Student;

use DB;
use JSON;
use Emergence\People\Person;
use Emergence\People\PeopleRequestHandler;
use Emergence\Mailer\Mailer;
#use Emergence\Dwoo\Engine AS DwooEngine;
#use Emergence\CRM\Message;
#use Emergence\CRM\MessageRecipient;


class SectionTermReportsRequestHandler extends \RecordsRequestHandler
{
    public static $printTemplate = 'sectionTermReports';

    public static $recordClass = SectionTermReport::class;
    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelRead = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelAPI = 'Staff';
    public static $browseOrder = '(SELECT CONCAT(LastName,FirstName) FROM people WHERE people.ID = StudentID)';
    public static $userResponseModes = [
        'application/json' => 'json',
        'text/csv' => 'csv',
        'application/pdf' => 'pdf'
    ];


    public static function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case '*authors':
                return static::handleAuthorsRequest();
            case '*emails':
                return static::handleEmailsRequest();
            case '*email-preview':
                return static::handleEmailPreviewRequest();
            case '*print':
                return static::handlePrintRequest();
            default:
                return parent::handleRecordsRequest($action);
        }
    }

    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        static::applyRequestFilters($conditions, $responseData);

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }

    public static function handleAuthorsRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');

        return static::respond('authors', [
            'data' => Person::getAllByQuery(
                'SELECT DISTINCT Person.* FROM `%s` Report JOIN `%s` Person ON Person.ID = Report.CreatorID',
                [
                    SectionTermReport::$tableName,
                    Person::$tableName
                ]
            )
        ]);
    }

    public static function handleEmailsRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');

        $responseData = [];


        // send previewed emails
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            // TODO: create Emergence\CRM\Message instances instead of mailing directly

            $emails = JSON::getRequestData();

            if (empty($emails) || !is_array($emails)) {
                throw new \Exception('POSTed JSON data is not array as expected');
            }

            // render and send each email
            $emailsCount = 0;
            $recipientsCount = 0;

            foreach ($emails AS $email) {
                $reports = [];
                $recipients = [];

                foreach ($email['reports'] AS $reportId) {
                    $Report = SectionTermReport::getByID($reportId);

                    if ($Report->Status == 'published') {
                        $reports[] = $Report;
                    }
                }

                foreach ($email['recipients'] AS $recipientId) {
                    $recipients[] = Person::getByID($recipientId)->EmailRecipient;
                }

                // filter out any unavailable recipients
                $recipients = array_filter($recipients);
                $recipientsCount += count($recipients);

                // prepare template data
                $emailData = static::getEmailTemplateData($reports);

                // add central achive recipient
                if (Slate::$userEmailDomain) {
                    if (count($emailData['students']) == 1) {
                        $recipients[] = 'progress+'.$emailData['students'][0]->Username.'@'.Slate::$userEmailDomain;
                    } else {
                        $recipients[] = 'progress@'.Slate::$userEmailDomain;
                    }
                }

                // send email
                $emailsCount += Mailer::sendFromTemplate(implode(', ', $recipients), 'reports', $emailData);
            }

            return static::respond('emailsSent', [
                'success' => true,
                'emailsCount' => $emailsCount,
                'recipientsCount' => $recipientsCount
            ]);
        }


        // fetch potential emails for preview
        $conditions = [
            'Status' => 'published'
        ];

        static::applyRequestFilters($conditions, $responseData);

        if (empty($_REQUEST['recipients'])) {
            $recipients = [];
        } elseif (is_array($_REQUEST['recipients'])) {
            $recipients = $_REQUEST['recipients'];
        } else {
            $recipients = explode(',', $_REQUEST['recipients']);
        }


        // fetch all term reports
        $reports = SectionTermReport::getAllByWhere($conditions);


        // group interims by student
        $students = [];
        foreach ($reports AS $Report) {
            if (!isset($students[$Report->StudentID])) {
                $students[$Report->StudentID] = [
                    'student' => $Report->Student,
                    'recipients' => [],
                    'reports' => []
                ];
            }

            $students[$Report->StudentID]['reports'][] = $Report->ID;
        }


        // collect recipients
        foreach ($students AS &$student) {
            $student['recipients'][] = [
                'id' => $student['student']->ID,
                'name' => $student['student']->FullName,
                'email' => $student['student']->Email,
                'relationship' => 'student'
            ];

            if (in_array('advisor', $recipients) && $student['student']->Advisor) {
                $student['recipients'][] = [
                    'id' => $student['student']->Advisor->ID,
                    'name' => $student['student']->Advisor->FullName,
                    'email' => $student['student']->Advisor->Email,
                    'relationship' => 'advisor'
                ];
            }

            if (in_array('guardians', $recipients)) {
                foreach ($student['student']->GuardianRelationships AS $GuardianRelationship) {
                    if (!$GuardianRelationship->RelatedPerson->Email) {
                        continue;
                    }

                    $student['recipients'][] = [
                        'id' => $GuardianRelationship->RelatedPerson->ID,
                        'name' => $GuardianRelationship->RelatedPerson->FullName,
                        'email' => $GuardianRelationship->RelatedPerson->Email,
                        'relationship' => $GuardianRelationship->Label
                    ];
                }
            }

            // clear out any contacts with email unavailable
            $student['recipients'] = array_values(array_filter($student['recipients']));
        }


        // return response
        $responseData['data'] = array_values($students);

        return static::respond('emails', $responseData);
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
        $reports = SectionTermReport::getAllByWhere('ID IN ('.implode(',', $reportIds).')');

        return static::respond('reports.email', static::getEmailTemplateData($reports));
    }

    public static function handlePrintRequest()
    {
        $Session = $GLOBALS['Session'];

        $Session->requireAccountLevel('Staff');

        if (empty($_REQUEST['termID']) || !is_numeric($_REQUEST['termID'])) {
            $Term = Term::getCurrent();
        } elseif (!$Term = Term::getByID($_REQUEST['termID'])) {
            return static::throwNotFoundError('Term not found');
        }

        $filename = 'Narrative Reports';
        $where = [
            'TermID' => $Term->ID
        ];

        if (!empty($_REQUEST['sectionID']) && is_numeric($_REQUEST['sectionID'])) {
            $where['CourseSectionID'] = $_REQUEST['sectionID'];
        }

        if (!empty($_REQUEST['advisorID']) && is_numeric($_REQUEST['advisorID']) && ($Advisor = Person::getByID($_REQUEST['advisorID']))) {
            $where[] = 'StudentID IN (SELECT Student.ID FROM people Student WHERE Student.AdvisorID = '.$_REQUEST['advisorID'].')';
            $filename .= ' - '.$Advisor->LastName;
        }

        if (!empty($_REQUEST['authorID']) && is_numeric($_REQUEST['authorID']) && ($Author = Person::getByID($_REQUEST['authorID']))) {
            $where[] = 'CreatorID = '.$_REQUEST['authorID'];
            $filename .= ' - by '.$Author->Username;
        }

        if (!empty($_REQUEST['studentID']) && is_numeric($_REQUEST['studentID']) && ($Student = Person::getByID($_REQUEST['studentID']))) {
            $where['StudentID'] = $_REQUEST['studentID'];
            $filename .= ' - '.$Student->Username;
        }

        $html = \TemplateResponse::getSource(static::$printTemplate, [
            'Term' => $Term
            ,'data' => SectionTermReport::getAllByWhere($where, [
                'order' => '(SELECT CONCAT(LastName,FirstName) FROM people WHERE people.ID = StudentID)'
                ,'limit' => (!empty($_REQUEST['limit']) && is_numeric($_REQUEST['limit'])) ? $_REQUEST['limit'] : false
            ])
        ]);

        if (static::peekPath() == 'preview') {
            die($html);
        }

        $filename .= ' ('.date('Y-m-d').')';
        $filePath = tempnam('/tmp', 'slate_nr_');

        file_put_contents($filePath.'.html', $html);
        $command = "xvfb-run --server-args=\"-screen 0, 1024x768x24\" wkhtmltopdf \"$filePath.html\" \"$filePath.pdf\"";


        if (static::peekPath() == 'stage') {
            die($command);
        } else {
            exec($command);

            header('Content-Type: application/pdf');
            header("Content-Disposition: attachment; filename=\"$filename.pdf\"");
            readfile($filePath.'.pdf');
            exit();
        }
    }


    // internal library
    protected static function getEmailTemplateData(array $reports)
    {
        // collect terms and students
        $terms = [];
        $students = [];

        foreach ($reports AS $Report) {
            if (!in_array($Report->Term, $terms)) {
                $terms[] = $Report->Term;
            }

            if (!in_array($Report->Student, $students)) {
                $students[] = $Report->Student;
            }
        }

        return [
            'data' => $reports,
            'terms' => $terms,
            'students' => $students
        ];
    }

    protected static function applyRequestFilters(array &$conditions = [], array &$responseData = [])
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
            $responseData['advisor'] = $Advisor;
        }


        // optionally filter by author
        if (!empty($_REQUEST['author'])) {
            if (!$Author = PeopleRequestHandler::getRecordByHandle($_REQUEST['author'])) {
                return static::throwNotFoundError('author not found');
            }

            $conditions['CreatorID'] = $Author->ID;
            $responseData['author'] = $Author;
        }


        // optionally filter by student
        if (!empty($_REQUEST['student'])) {
            if (!$Student = PeopleRequestHandler::getRecordByHandle($_REQUEST['student'])) {
                return static::throwNotFoundError('student not found');
            }

            $conditions['StudentID'] = $Student->ID;
            $responseData['student'] = $Student;
        }


        // optionally filter by course section
        if (!empty($_REQUEST['course_section'])) {
            if (!$Section = Section::getByHandle($_REQUEST['course_section'])) {
                return static::throwNotFoundError('course_section not found');
            }

            $conditions['SectionID'] = $Section->ID;
            $responseData['course_section'] = $Section;
        }


        // optionally filter by list of students
        if (!empty($_REQUEST['students'])) {
            $studentIds = [];

            foreach (Student::getAllByListIdentifier($_REQUEST['students']) AS $Student) {
                $studentIds[] = $Student->ID;
            }

            $conditions[] = sprintf('StudentID IN (%s)', count($studentIds) ? join(',', $studentIds) : '0');
        }


        // optionally filter by status
        if (!empty($_REQUEST['status'])) {
            if (!in_array($_REQUEST['status'], SectionTermReport::getFieldOptions('Status', 'values'))) {
                return static::throwInvalidRequestError('Invalid status');
            }

            $conditions['Status'] = $_REQUEST['status'];
        }
    }
}