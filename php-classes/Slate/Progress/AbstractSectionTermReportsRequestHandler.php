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


abstract class AbstractSectionTermReportsRequestHandler extends \RecordsRequestHandler
{
    public static $recipientClass;

    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelRead = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelAPI = 'Staff';
    public static $browseOrder = '(SELECT CONCAT(LastName,FirstName) FROM people WHERE people.ID = StudentID), (SELECT `Left` FROM terms WHERE terms.ID = TermID) DESC';
    public static $userResponseModes = [
        'application/json' => 'json',
        'text/csv' => 'csv',
        'application/pdf' => 'pdf',
        'text/html; display=print' => 'print'
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
            default:
                return parent::handleRecordsRequest($action);
        }
    }

    public static function handleBrowseRequest($options = [], $conditions = [], $responseId = null, $responseData = [])
    {
        static::applyRequestFilters($conditions, $responseData);

        $responseData = array_merge(static::getExtraResponseData(), $responseData);

        return parent::handleBrowseRequest($options, $conditions, $responseId, $responseData);
    }

    public static function handleAuthorsRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');
        $recordClass = static::$recordClass;

        return static::respond('authors', [
            'data' => Person::getAllByQuery(
                'SELECT DISTINCT Person.* FROM `%s` Report JOIN `%s` Person ON Person.ID = Report.CreatorID',
                [
                    $recordClass::$tableName,
                    Person::$tableName
                ]
            )
        ]);
    }

    public static function handleEmailsRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');
        set_time_limit(0);
        $recordClass = static::$recordClass;
        $recipientClass = static::$recipientClass;

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

                // compile reports
                $reports = [];
                foreach ($email['reports'] AS $reportId) {
                    $Report = $recordClass::getByID($reportId);

                    if ($Report->Status == 'published') {
                        $reports[] = $Report;
                    }
                }

                $recipientEmails = [];
                foreach ($email['recipients'] AS $recipientId) {
                    $Person = Person::getByID($recipientId);

                    if (!$Person || !$Person->PrimaryEmail) {
                        continue;
                    }

                    $recipientEmails[] = $Person->PrimaryEmail;
                }

                // filter out any unavailable recipients
                $recipientsCount += count($recipientEmails);

                // skip if no recipients
                if ($recipientsCount == 0) {
                    continue;
                }

                // prepare template data
                $emailData = static::getEmailTemplateData($reports);

                // add central achieve recipient
                // TODO: make this configurable
                if (Slate::$userEmailDomain) {
                    if (count($emailData['students']) == 1) {
                        $recipientEmails[] = 'progress+'.$emailData['students'][0]->Username.'@'.Slate::$userEmailDomain;
                    } else {
                        $recipientEmails[] = 'progress@'.Slate::$userEmailDomain;
                    }
                }

                // serialize recipients
                $recipientEmailStrings = [];
                foreach ($recipientEmails as $recipientEmail) {
                    $recipientEmailStrings[] = is_string($recipientEmail) ? $recipientEmail : $recipientEmail->toRecipientString();
                }

                // send email
                $sent = Mailer::sendFromTemplate(implode(', ', $recipientEmailStrings), static::getTemplateName($recordClass::$pluralNoun), $emailData);
                $emailsCount += $sent;

                // save receipts
                foreach ($recipientEmails as $recipientEmail) {
                    if (is_string($recipientEmail)) {
                        continue;
                    }

                    foreach ($emailData['students'] as $Student) {
                        foreach ($emailData['terms'] as $Term) {
                            $recipientClass::create([
                                'StudentID' => $Student->ID,
                                'TermID' => $Term->ID,
                                'EmailContactID' => $recipientEmail->ID,
                                'Status' => $sent > 0 ? 'sent' : 'failed'
                            ], true);
                        }
                    }
                }
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
        $reports = $recordClass::getAllByWhere($conditions);

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
            $sentRecipients = $recipientClass::getAllByWhere([
                'StudentID' => $student['student']->ID,
                'TermID' => $conditions['TermID']
            ]);

            $sentByEmail = [];
            foreach ($sentRecipients as $sentRecipient) {
                $sentByEmail[$sentRecipient->EmailContactID] = $sentRecipient->Status;
            }

            if (in_array('student', $recipients)) {
                $student['recipients'][] = [
                    'id' => $student['student']->ID,
                    'name' => $student['student']->FullName,
                    'email' => $student['student']->Email,
                    'relationship' => 'student',
                    'status' => $sentByEmail[$student['student']->PrimaryEmailID] ?: 'proposed'
                ];
            }

            if (in_array('advisor', $recipients) && $student['student']->Advisor) {
                $student['recipients'][] = [
                    'id' => $student['student']->Advisor->ID,
                    'name' => $student['student']->Advisor->FullName,
                    'email' => $student['student']->Advisor->Email,
                    'relationship' => 'advisor',
                    'status' => $sentByEmail[$student['student']->Advisor->PrimaryEmailID] ?: 'proposed'
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
                        'relationship' => $GuardianRelationship->Label,
                        'status' => $sentByEmail[$GuardianRelationship->RelatedPerson->PrimaryEmailID] ?: 'proposed'
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
        $GLOBALS['Session']->requireAccountLevel('Staff');
        $recordClass = static::$recordClass;

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
        $reports = $recordClass::getAllByWhere('ID IN ('.implode(',', $reportIds).')');

        return static::respond(static::getTemplateName($recordClass::$pluralNoun).'.email', static::getEmailTemplateData($reports));
    }


    // internal library
    protected static function getExtraResponseData()
    {
        $recordClass = static::$recordClass;

        return [
            'recordClass' => $recordClass,
            'reportSingularNoun' => $recordClass::getNoun(1),
            'reportPluralNoun' => $recordClass::getNoun(2)
        ];
    }

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

        return array_merge(static::getExtraResponseData(), [
            'data' => $reports,
            'terms' => $terms,
            'students' => $students
        ]);
    }

    protected static function applyRequestFilters(array &$conditions = [], array &$responseData = [])
    {
        $recordClass = static::$recordClass;

        // always filter by term
        if (!empty($_REQUEST['term'])) {
            if (!$Term = Term::getByHandle($_REQUEST['term'])) {
                return static::throwNotFoundError('term not found');
            }
        } else {
            $Term = Term::getClosest();
        }

        $conditions['TermID'] = ['values' => $Term->getRelatedTermIDs()];
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
            $courseSections = [];
            if (!is_array($_REQUEST['course_section'])) {
                $requestedCourseSections = explode(',', $_REQUEST['course_section']);
            } else {
                $requestedCourseSections = $_REQUEST['course_section'];
            }

            foreach ($requestedCourseSections as $courseSection) {
                if (!$Section = Section::getByHandle($courseSection)) {
                    return static::throwNotFoundError(sprintf('course_section %s not found', $courseSection));
                }
                $courseSections[$Section->ID] = $Section;
            }

            if (count($courseSections) === 1) {
                $courseSectionIds = array_keys($courseSections);
                $conditions['SectionID'] = $courseSectionIds[0];
                $responseData['course_section'] = $Section;
            } else {
                $conditions['SectionID'] = [
                    'operator' => 'IN',
                    'values' => array_keys($courseSections)
                ];
                $responseData['course_section'] = $courseSections;
            }

        }


        // optionally filter by list of students
        if (!empty($_REQUEST['students'])) {
            $studentIds = [];

            try {
                foreach (Student::getAllByListIdentifier($_REQUEST['students']) AS $Student) {
                    $studentIds[] = $Student->ID;
                }
            } catch (\Exception $e) {
                return static::throwNotFoundError('Unable to load students list: ' . $e->getMessage());
            }

            $conditions[] = sprintf('StudentID IN (%s)', count($studentIds) ? join(',', $studentIds) : '0');
        }


        // optionally filter by status
        if (!empty($_REQUEST['status'])) {
            if (!in_array($_REQUEST['status'], $recordClass::getFieldOptions('Status', 'values'))) {
                return static::throwInvalidRequestError('Invalid status');
            }

            $conditions['Status'] = $_REQUEST['status'];
        }
    }
}