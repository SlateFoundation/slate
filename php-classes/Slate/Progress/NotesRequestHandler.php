<?php

namespace Slate\Progress;

use Emergence\People\Person;
use Emergence\People\Relationship;

use Emergence\CRM\Message;
use Emergence\CRM\GlobalRecipient;

use Slate\Progress\Note;
use Slate\Courses\SectionParticipant;
use Slate\Courses\Section;
use Slate\Term;

class NotesRequestHandler extends \Emergence\CRM\MessagesRequestHandler
{
    public static $recordClass = Note::class;
    public static $globalRecipients = array();

    public static function handleRequest()
    {
        if(0===strpos($_SERVER['CONTENT_TYPE'],'application/json'))
        {
			$_REQUEST = \JSON::getRequestData();
		}

        return static::handleRecordsRequest();
    }

    public static function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
    {
        $conditions['Class'] = Note::class;
        $conditions[] = sprintf('Status IN ("Shared Draft", "Sent") OR (Status = "Private Draft" AND AuthorID = %u)', $GLOBALS['Session']->PersonID);

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }

    public static function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case 'progress':
            {
                return static::handleProgressNotesRequest();
            }

            case 'recipients':
            {
                return static::handleRecipientsRequest();
            }

            case 'addCustomRecipient':
            {
                return static::handleCustomRecipientRequest();
            }

            default:
            {
                return parent::handleRecordsRequest($action);
            }
        }
    }

    public static function handleProgressNotesRequest()
    {

        if (!empty($_REQUEST['messageID'])) {
            $Message = Message::getByID($_REQUEST['messageID']);
            $Person = Person::getByID($Message->ContextID);
        }

        if (!$Person && !empty($_REQUEST['username'])) {
            $Person = \Emergence\People\User::getByUsername($_REQUEST['username']);
        } elseif (!$Person && !empty($_REQUEST['personID'])) {
            $Person = Person::getByID($_REQUEST['personID']);
        } elseif(!$Person) {
            return static::throwInvalidRequestError();
        }

        switch ($action = static::shiftPath()) {
            case 'recipients':
            {
                return static::handleRecipientsRequest($Person, $Message);
            }

            default:
            {
                return static::respond('notes', array(
                    'success' => true
                    ,'data' => Slate\Progress\Note::getAllByWhere(array(
                        'ContextClass' => 'Person'
                        ,'ContextID' => $Person->ID
                        ,sprintf('Status IN ("Shared Draft", "Sent") OR (Status = "Private Draft" AND AuthorID = %u)', $GLOBALS['Session']->PersonID)
                    ))
                ));
            }
        }

    }

    public static function handleRecipientsRequest($Person = false, $Message = false)
    {
        if (!$Person && !$Person = Person::getByID($_REQUEST['personID'])) {
            return static::throwError('Person not found');
        }

        if (!$Message && !empty($_REQUEST['messageID'])) {
            $Message = Message::getByID($_REQUEST['messageID']);
        }

        // build list of suggested recipients
        $contacts = array();
        // the target person
        $contacts[$Person->ID] = static::_getRecipientFromPerson($Person, ($Person->isA('Slate\\Student') ? 'Slate\\Student' : 'User'));

        // related contacts
        foreach (Relationship::getAllByPerson($Person) AS $Relationship) {
            if(!$Relationship->RelatedPerson->Email) continue;
            $contacts[$Relationship->RelatedPersonID] = static::_getRecipientFromPerson($Relationship->RelatedPerson, $Relationship->Label, 'Related Contacts');
        }
        
        $lastTerm = Term::getCurrent();
        $lastTerm = $lastTerm ? $lastTerm : Term::getLastTerm();

        // instructors
        $studentInstructors = \DB::allRecords(
            'SELECT InstructorPart.PersonID AS instructorID, GROUP_CONCAT(InstructorPart.CourseSectionID SEPARATOR ",") AS sectionIDs'
            .' FROM `%s` StudentPart'
            .' RIGHT JOIN `%s` InstructorPart ON(InstructorPart.CourseSectionID=StudentPart.CourseSectionID AND InstructorPart.Role = "Instructor")'
            .' LEFT JOIN course_sections Section ON (Section.ID = InstructorPart.CourseSectionID)'
            .' WHERE StudentPart.PersonID = %u AND StudentPart.Role = "Student" AND Section.TermID IN (%4$s)'
            .' GROUP BY InstructorPart.PersonID'
            ,array(
                SectionParticipant::$tableName
                ,SectionParticipant::$tableName
                ,$Person->ID
                ,implode(',', $lastTerm->getConcurrentTermIDs())
            )
        );

        foreach ($studentInstructors AS $si) {
            $sectionCodes = array_map(function($sectionID) {
                return Section::getByID($sectionID)->Course->Code;
            }, explode(',', $si['sectionIDs']));

            $contacts[$si['instructorID']] = static::_getRecipientFromPerson(Person::getByID($si['instructorID']), 'Teacher ('.join(', ',$sectionCodes).')', 'Teachers');
        }

        // advisor
        if ($Person->AdvisorID) {
            if (array_key_exists($Person->AdvisorID, $contacts)) {
                $contacts[$Person->AdvisorID]['Label'] = 'Advisor, '.$contacts[$Person->AdvisorID]['Relationship'];
            } else {
                $contacts[$Person->AdvisorID] = static::_getRecipientFromPerson($Person->Advisor, 'Advisor', 'Teachers');
            }
        }

        // school-wide staff
        foreach (GlobalRecipient::getAll() AS $globalRecipient) {
            $contacts[$globalRecipient->PersonID] = static::_getRecipientFromPerson(Person::getByID($globalRecipient->PersonID), $globalRecipient->Title, 'Global Recipients');
        }

        // mark recieved recipients
        if ($Message) {
            foreach ($Message->Recipients AS $Recipient) {
                if (array_key_exists($Recipient->PersonID, $contacts)) {
                    $contacts[$Recipient->PersonID]['Status'] = $Recipient->Status;
                } else {
                    $contacts[$Recipient->PersonID] = static::_getRecipientFromPerson($Recipient->Person, 'Message Recipient', 'Other Recipients');
                    $contacts[$Recipient->PersonID]['Status'] = $Recipient->Status;
                }
            }
        }


        return static::respond('noteRecipients', array(
            'success' => true
            ,'data' => array_values($contacts)
        ));
    }

    public static function respond($responseID, $responseData = array(), $responseMode = false)
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

                $filename .=  $Student ? (' ' . $Student->FullName) : '';

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

    public static function handleCustomRecipientRequest()
    {
        if (!empty($_REQUEST['Person']) && !empty($_REQUEST['Email']) && !empty($_REQUEST['StudentID'])) {
            if (!is_numeric($_REQUEST['Person'])) {
                $nameData = Person::parseFullName($_REQUEST['Person']);

                $recipientData = array('Email' => $_REQUEST['Email']);

                if ($RecipientPerson = Person::getByFullName($nameData['FirstName'], $nameData['LastName'])) {
                    if (!$EmailContactPoint = \Emergence\People\ContactPoint\Email::getByWhere(array('PersonID'=>$RecipientPerson->ID, 'Data'=>serialize($_REQUEST['Email'])))) {
                        return static::throwError($RecipientPerson->FullName.' exists in the database already. Please select user from combo or use a different name');
                    }
                } else {
                    $RecipientPerson = Person::create(array_merge($recipientData, $nameData), true);
                }
            } else {
                $RecipientPerson = Person::getByID($_REQUEST['Person']);
            }

            $email = ($RecipientPerson->Email == $_REQUEST['Email']) ? false : $_REQUEST['Email'];

            if ($_REQUEST['Relationship']) {
                if (!$Relationship = Relationship::getByWhere(array('PersonID'=>$_REQUEST['StudentID'], 'RelatedPersonID' => $RecipientPerson->ID))) {
                    $Relationship = Relationship::create(array(
                        'PersonID' => $_REQUEST['StudentID']
                        ,'RelatedPersonID' => $RecipientPerson->ID
                        ,'Label' => $_REQUEST['Label']
                    ), true);
                }
            }

            $recipient = static::_getRecipientFromPerson($RecipientPerson, $Relationship->Label, 'Other', $email);

            return static::respond('notes', array(
                'success' => true
                ,'data' => $recipient
            ));
        }
    }

    protected static function _getRecipientFromPerson(Person $Person, $relationship = false, $relationshipGroup = false, $email = false)
    {
        return array(
            'PersonID' => $Person->ID
            ,'FullName' => $Person->FullName
            ,'Email' => !$email ? $Person->Email : $email
            ,'Label' => $relationship
            ,'RelationshipGroup' => $relationshipGroup
        );
    }
}
