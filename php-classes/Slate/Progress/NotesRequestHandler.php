<?php

namespace Slate\Progress;

use Emergence\People\Person;
use Emergence\People\User;
use Emergence\People\Relationship;

use Emergence\CRM\Message;
use Emergence\CRM\MessageRecipient;
use Emergence\CRM\GlobalRecipient;

use Slate\People\Student;
use Slate\Progress\Note;
use Slate\Courses\SectionParticipant;
use Slate\Courses\Section;
use Slate\Term;

class NotesRequestHandler extends \Emergence\CRM\MessagesRequestHandler
{
    public static $recordClass = Note::class;
    public static $globalRecipients = [];

    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        $conditions['Class'] = Note::class;
        $conditions[] = sprintf('Status IN ("draft-shared", "sent") OR (Status = "draft-private" AND AuthorID = %u)', $GLOBALS['Session']->PersonID);

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }

    public static function handleRecordsRequest($action = false)
    {
        switch ($action ?: $action = static::shiftPath()) {
            case 'progress':
                return static::handleProgressNotesRequest();
            case 'recipients':
                return static::handleRecipientsRequest();
            default:
                return parent::handleRecordsRequest($action);
        }
    }

    public static function handleProgressNotesRequest()
    {
        if (!empty($_REQUEST['messageID'])) {
            if (!$Message = Message::getByID($_REQUEST['messageID'])) {
                return static::throwNotFoundError('Message not found');
            }

            $Person = Person::getByID($Message->ContextID);
        }

        if (!$Person && !empty($_REQUEST['username'])) {
            $Person = User::getByUsername($_REQUEST['username']);
        } elseif (!$Person && !empty($_REQUEST['personID'])) {
            $Person = Person::getByID($_REQUEST['personID']);
        } elseif (!$Person) {
            return static::throwInvalidRequestError();
        }

        switch ($action = static::shiftPath()) {
            case 'recipients':
                return static::handleRecipientsRequest($Person, $Message);
            default:
                return static::respond('notes', [
                    'success' => true,
                    'data' => Note::getAllByWhere([
                        'ContextClass' => 'Person',
                        'ContextID' => $Person->ID,
                        sprintf('Status IN ("draft-shared", "sent") OR (Status = "draft-private" AND AuthorID = %u)', $GLOBALS['Session']->PersonID)
                    ])
                ]);
        }
    }

    public static function handleRecipientsRequest($Person = false, $Message = false)
    {
        if (!$Person && !($Person = Person::getByID($_REQUEST['personID']))) {
            return static::throwNotFoundError('Person not found');
        }

        if (!$Message && !empty($_REQUEST['messageID'])) {
            if (!$Message = Message::getByID($_REQUEST['messageID'])) {
                return static::throwNotFoundError('Message not found');
            }
        }


        // collect existing recipients by Person ID
        $recipients = [];
        if ($Message) {
            foreach ($Message->Recipients as $Recipient) {
                $recipients[$Recipient->PersonID] = [
                    'Recipient' => $Recipient,
                    'matched' => false
                ];
            }
        }


        // build list of suggested recipients, starting with the target person
        $contacts = [
            static::_getRecipientFromPerson($Person, [
                'label' => $Person->isA(Student::class) ? 'Student' : 'User',
                'recipients' => &$recipients
            ])
        ];

        // teachers
        if ($Term = Term::getClosest()) {
            $studentInstructors = \DB::allRecords(
                'SELECT TeacherPart.PersonID AS instructorID, GROUP_CONCAT(TeacherPart.CourseSectionID SEPARATOR ",") AS sectionIDs'
                .' FROM `%s` StudentPart'
                .' RIGHT JOIN `%s` TeacherPart ON(TeacherPart.CourseSectionID=StudentPart.CourseSectionID AND TeacherPart.Role = "Teacher")'
                .' LEFT JOIN course_sections Section ON (Section.ID = TeacherPart.CourseSectionID)'
                .' WHERE StudentPart.PersonID = %u AND StudentPart.Role = "Student" AND Section.TermID IN (%4$s)'
                .' GROUP BY TeacherPart.PersonID',
                [
                    SectionParticipant::$tableName,
                    SectionParticipant::$tableName,
                    $Person->ID,
                    implode(',', $Term->getConcurrentTermIDs())
                ]
            );

            foreach ($studentInstructors AS $si) {
                $sectionCodes = array_map(function($sectionID) {
                    return Section::getByID($sectionID)->Course->Code;
                }, explode(',', $si['sectionIDs']));

                $contacts[] = static::_getRecipientFromPerson(Person::getByID($si['instructorID']), [
                    'group' => 'Teachers',
                    'label' => 'Teacher ('.join(', ',$sectionCodes).')',
                    'recipients' => &$recipients
                ]);
            }
        }

        // advisor
        if ($Person->AdvisorID) {
            $contacts[] = static::_getRecipientFromPerson($Person->Advisor, [
                'group' => 'School Contacts',
                'label' => 'Advisor',
                'recipients' => &$recipients
            ]);
        }

        // school-wide staff
        foreach (GlobalRecipient::getAll() as $globalRecipient) {
            $contacts[] = static::_getRecipientFromPerson(Person::getByID($globalRecipient->PersonID), [
                'group' => 'School Contacts',
                'label' => $globalRecipient->Title,
                'recipients' => &$recipients
            ]);
        }

        // related contacts
        foreach ($Person->Relationships as $Relationship) {
            $contacts[] = static::_getRecipientFromPerson($Relationship->RelatedPerson, [
                'group' => 'Related Contacts',
                'label' => $Relationship->Label,
                'recipients' => &$recipients
            ]);
        }


        // add any additional recipients
        foreach ($recipients as $recipient) {
            if ($recipient['matched']) {
                continue;
            }

            $contacts[] = static::_getRecipientFromPerson($recipient['Recipient']->Person, [
                'recipients' => &$recipients
            ]);
        }


        return static::respond('noteRecipients', [
            'success' => true,
            'data' => $contacts
        ]);
    }

    // TODO: delete this?
    public static function respond($responseID, $responseData = [], $responseMode = false)
    {
        $className = static::$recordClass;

        if ($responseMode == 'pdf') {
            $html = \TemplateResponse::getSource($className::$pdfTemplate, $responseData);
            if ($_REQUEST['export']) {
                if ($query = $responseData['query']) {
                    $query = explode(' ', $query);
                    $personID = false;

                    for ($i = 0; $i < count($query) && !$personID; $i++) {
                        $termArray = explode(':', $query[$i]);

                        if ($termArray[0] == 'person') {
                            $personID = $termArray[1];
                        }
                    }

                    if ($personID) {
                        $Student = \Slate\People\Student::getByID($personID);
                    }
                }

                $filename .= ' ('.date('Y-m-d').')';

                $filename .=  $Student ? (' '.$Student->FullName) : '';

                $filename .= ' Progress Reports';
                $filePath = tempnam('/tmp', 'slate_nr_');

                file_put_contents($filePath.'.html', $html);
                $command = "/usr/local/bin/wkhtmltopdf \"$filePath.html\" \"$filePath.pdf\"";

                exec($command);

                $tokenName = strtolower($className).'DownloadToken';

                if (!empty($_REQUEST[$tokenName])) {
                    setcookie($tokenName, $_REQUEST[$tokenName], time()+300, '/');
                }

                header('Content-Type: application/pdf');
                header("Content-Disposition: attachment; filename=\"$filename.pdf\"");
                readfile($filePath.'.pdf');
                exit();
            } else {
                die($html);
            }
        }

        return parent::respond($responseID, $responseData);
    }

    protected static function _getRecipientFromPerson(Person $Person, array $options = [])
    {
        $data = [
            'PersonID' => $Person->ID,
            'FullName' => $Person->FullName,
            'Email' => !empty($options['email']) ? $options['email'] : ($Person->PrimaryEmail ? $Person->PrimaryEmail->toString() : null),
            'Label' => !empty($options['label']) ? $options['label'] : null,
            'RelationshipGroup' => !empty($options['group']) ? $options['group'] : null,
            'Status' => null
        ];

        if (!empty($options['recipients']) && !empty($options['recipients'][$Person->ID])) {
            $Recipient = $options['recipients'][$Person->ID]['Recipient'];

            $data['Email'] = $Recipient->EmailContact->toString();
            $data['Status'] = $Recipient->Status;

            $options['recipients'][$Person->ID]['matched'] = true;
        }

        return $data;
    }
}
