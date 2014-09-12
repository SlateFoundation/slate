<?php

namespace Slate\Connectors\GoogleSheets;

use Slate;
use Slate\Term;

use Slate\People\Student;
use Emergence\People\User;
use Emergence\People\Groups\Group;
use Emergence\People\ContactPoint\Email;
use Emergence\People\ContactPoint\Phone;
use Emergence\People\ContactPoint\Postal;

use Emergence\Locations\Location;
use Slate\Courses\Course;
use Slate\Courses\Section;
use Slate\Courses\Schedule;
use Slate\Courses\SectionParticipant;

use SpreadsheetReader;
use Emergence\Util\Capitalizer;
use Emergence\Connectors\Job;
use Emergence\Connectors\Mapping;
use Psr\Log\LogLevel;


class Connector extends \Slate\Connectors\AbstractSpreadsheetConnector implements \Emergence\Connectors\ISynchronize
{
    public static $title = 'Google Sheets';
    public static $connectorId = 'google-sheets';

    // column map
    public static $studentColumns = array(
        'School ID Number' => 'StudentNumber',
            'ID' => 'StudentNumber',
        'First Name' => 'FirstName',
            'First' => 'FirstName',
        'Last Name' => 'LastName',
            'Last' => 'LastName',
        'Middle Name' => 'MiddleName',
            'Middle' => 'MiddleName',
        'Gender' => 'Gender',
            'Sex' => 'Gender',
        'Birth Date' => 'BirthDate',
            'Birthday' => 'BirthDate',
        'Graduation Year' => 'GraduationYear',
            'Graduation' => 'GraduationYear',
        'Cohort' => 'Group', 'Group' => 'Group',
        'Advisor' => 'AdvisorUsername',
#        'Username',
#        'Assigned Password',
#        'Email',
#        'Phone',
#        'Postal Address'
    );
    
    public static $studentRootGroup = 'students';

    public static $staffColumns = array(
        'First Name' => 'FirstName',
            'First' => 'FirstName',
        'Last Name' => 'LastName',
            'Last' => 'LastName',
        'Middle Name' => 'MiddleName',
            'Middle' => 'MiddleName',
        'Gender' => 'Gender',
            'Sex' => 'Gender',
        'Birth Date' => 'BirthDate',
            'Birthday' => 'BirthDate',
#        'StaffID',
        'Username' => 'Username',
#        'Assigned Password',
        'Account Level' => 'AccountLevel',
            'Account Type' => 'AccountLevel',
        'Role / Job Title' => 'Title',
        'Email' => 'Email',
#        'Phone',
#        'Postal Address'
    );
    
    public static $staffRootGroup = 'staff';

    public static $sectionColumns = array(
        'Section ID' => 'SectionExternal',
        'Section Code' => 'SectionCode',
            'Section code' => 'SectionCode',
        'Title' => 'Title',
        'Course Code' => 'CourseCode',
            'Course code' => 'CourseCode',
        'Teacher' => 'TeacherUsername',
        'Term' => 'Term',
        'Schedule' => 'Schedule',
        'Location' => 'Location',
            'Room' => 'Location',
        'Students Capacity' => 'StudentsCapacity',
            '# of Students' => 'StudentsCapacity',
        'Notes' => 'Notes'
    );

    public static $sectionTitleFormatter;

    public static $enrollmentColumns = array(
        'School ID Number' => 'StudentNumber',
            'School ID' => 'StudentNumber'
    );


    // minimum required columns
    public static $studentRequiredColumns = array(
        'StudentNumber',
        'FirstName',
        'LastName'
    );

    public static $staffRequiredColumns = array(
        'FirstName',
        'LastName'
    );

    public static $sectionRequiredColumns = array(
        'CourseCode'
    );

    public static $enrollmentRequiredColumns = array(
        'StudentNumber'
    );


    // workflow implementations
    protected static function _getJobConfig(array $requestData)
    {
        $config = parent::_getJobConfig($requestData);

        $config['autoCapitalize'] = !empty($requestData['autoCapitalize']);
        $config['updateUsernames'] = !empty($requestData['updateUsernames']);

        $config['studentsCsv'] = !empty($requestData['studentsCsv']) ? $requestData['studentsCsv'] : null;
        $config['staffCsv'] = !empty($requestData['staffCsv']) ? $requestData['staffCsv'] : null;
        $config['sectionsCsv'] = !empty($requestData['sectionsCsv']) ? $requestData['sectionsCsv'] : null;
        $config['enrollmentsCsv'] = !empty($requestData['enrollmentsCsv']) ? $requestData['enrollmentsCsv'] : null;

        $config['masterTerm'] = !empty($requestData['masterTerm']) ? $requestData['masterTerm'] : null;

        return $config;
    }

    public static function synchronize(Job $Job, $pretend = true)
    {
        if ($Job->Status != 'Pending' && $Job->Status != 'Completed') {
            return static::throwError('Cannot execute job, status is not Pending or Complete');
        }


        // update job status
        $Job->Status = 'Pending';

        if (!$pretend) {
            $Job->save();
        }


        // init results struct
        $results = array();


        // uncap execution time
        set_time_limit(0);


        // execute tasks based on available spreadsheets
        if (!empty($Job->Config['studentsCsv'])) {
            $results['pull-students'] = static::pullStudents(
                $Job,
                $pretend,
                SpreadsheetReader::createFromStream(fopen($Job->Config['studentsCsv'], 'r'))
            );
        }

        if (!empty($Job->Config['staffCsv'])) {
            $results['pull-staff'] = static::pullStaff(
                $Job,
                $pretend,
                SpreadsheetReader::createFromStream(fopen($Job->Config['staffCsv'], 'r'))
            );
        }

        if (!empty($Job->Config['sectionsCsv'])) {
            $results['pull-sections'] = static::pullSections(
                $Job,
                $pretend,
                SpreadsheetReader::createFromStream(fopen($Job->Config['sectionsCsv'], 'r'))
            );
        }

        if (!empty($Job->Config['enrollmentsCsv'])) {
            $results['pull-enrollments'] = static::pullEnrollments(
                $Job,
                $pretend,
                SpreadsheetReader::createFromStream(fopen($Job->Config['enrollmentsCsv'], 'r'))
            );
        }


        // save job results
        $Job->Status = 'Completed';
        $Job->Results = $results;

        if (!$pretend) {
            $Job->save();
        }

        return true;
    }


    // task handlers
    public static function pullStudents(Job $Job, $pretend = true, SpreadsheetReader $spreadsheet)
    {
        // check input
        static::_requireColumns('Students', $spreadsheet, static::$studentRequiredColumns, static::$studentColumns);

        if (!($CurrentTerm = Term::getCurrent()) && !($CurrentTerm = Term::getNext())) {
            throw new \Exception('Could not find a current or next term');
        }

        $CurrentMasterTerm = $CurrentTerm->getMaster();


        // initialize results
        $results = array(
            'analyzed' => 0
        );


        // loop through rows
        $groups = array();
        $_formatPronoun = function($string, $familyName = false) use ($Job) {
            return $Job->Config['autoCapitalize'] ? Capitalizer::capitalizePronoun($string, $familyName) : $string;
        };

        while ($row = $spreadsheet->getNextRow()) {
            $row = static::_readRow($row, static::$studentColumns);
            $Record = null;
            $results['analyzed']++;

            // check required fields
            if (empty($row['StudentNumber'])) {
                $results['failed']['missing-required-field']['StudentNumber']++;
                $Job->log(sprintf('Missing student number for row %u', $results['analyzed']), LogLevel::ERROR);
                continue;
            }

            if (empty($row['FirstName'])) {
                $results['failed']['missing-required-field']['FirstName']++;
                $Job->log(sprintf('Missing student last name for row %u', $results['analyzed']), LogLevel::ERROR);
                continue;
            }

            if (empty($row['LastName'])) {
                $results['failed']['missing-required-field']['LastName']++;
                $Job->log(sprintf('Missing student last name for row %u', $results['analyzed']), LogLevel::ERROR);
                continue;
            }

            $Job->log(sprintf('Row %03u - analyzing student %s %s (#%u)', $results['analyzed'], $row['FirstName'], $row['LastName'], $row['StudentNumber']), LogLevel::DEBUG);


            // try to get existing student by school id #, or start creating a new record
            if (!$Record = Student::getByStudentNumber($row['StudentNumber'])) {
                $Record = Student::create(array(
                    'AccountLevel' => 'Student',
                    'StudentNumber' => $row['StudentNumber']
                ));
            }


            // apply values from spreadsheet
            $Record->FirstName = $_formatPronoun($row['FirstName']);
            $Record->LastName = $_formatPronoun($row['LastName'], true);

            if (!$Record->Username || !empty($Job->Config['updateUsernames'])) {
                if (!empty($row['Username'])) {
                    $Record->Username = $row['Username'];
                } else {
                    $domainConstraints = array();
                    if (!$Record->isPhantom) {
                        $domainConstraints[] = 'ID != ' . $Record->ID;
                    }

                    $Record->Username = Student::getUniqueUsername($Record->FirstName, $Record->LastName, array(
                        'domainConstraints' => $domainConstraints
                    ));
                }
            }

            if (!empty($row['MiddleName'])) {
                $Record->MiddleName = $row['MiddleName'];
            }

            if (!empty($row['Gender'])) {
                if ($row['Gender'] == 'M') {
                    $Record->Gender = 'Male';
                } elseif ($row['Gender'] == 'F') {
                    $Record->Gender = 'Female';
                }
            }

            if (!empty($row['BirthDate'])) {
                $Record->BirthDate = strtotime($row['BirthDate']);
            }

            if (!empty($row['GraduationYear'])) {
                $Record->GraduationYear = $row['GraduationYear'];
            } elseif (!empty($row['Grade'])) {
                $Record->GraduationYear = date('Y', strtotime($CurrentMasterTerm->EndDate)) + (12 - $row['Grade']);
            }

            // Set advisor
            if (!empty($row['AdvisorUsername'])) {
                if (!$Record->Advisor = User::getByUsername($row['AdvisorUsername'])) {
                    $results['failed']['advisor-not-found'][$row['AdvisorUsername']]++;
                    continue;
                }
            } else if (!empty($row['AdvisorID'])) {
                /* Student are coming in with advisor id, I think we need to import staff id's or convert that to a section
                if (!$Record->Advisor = User::getByField('AdvisorID',$row['AdvisorID'])) {
                    $results['failed']['advisor-not-found'][$row['AdvisorID']]++;
                    continue;
                }
                */
            }


            // assign email
            if (!empty($row['Email'])) {
                $Record->PrimaryEmail = Email::fromString($row['Email']);
                $Record->PrimaryEmail->Label = 'Staff Email';

                $Record->ContactPoints = array_merge($Record->ContactPoints, array($Record->PrimaryEmail));
            } elseif (Slate::$userEmailDomain) {
                // if one is already set and updateUsernames are enabled, check if this contact point should be destroyed
                if ($Record->PrimaryEmail) {
                    $emailUsername = $Record->PrimaryEmail->getLocalName();
                    $emailDomain = $Record->PrimaryEmail->getDomainName();

                    if ($emailDomain == Slate::$userEmailDomain && $emailUsername != $Record->Username && !empty($Job->Config['updateUsernames'])) {
                        $Record->PrimaryEmail->loadString(Slate::generateUserEmail($Record));
                    }
                } else {
                    $Record->PrimaryEmail = Email::fromString(Slate::generateUserEmail($Record));
                    $Record->PrimaryEmail->Label = 'School Email';

                    $Record->ContactPoints = array_merge($Record->ContactPoints, array($Record->PrimaryEmail));
                }
            }

            if ($Record->PrimaryEmail) {
                $logEntry = $Job->logRecordDelta($Record->PrimaryEmail, array(
                    'messageRenderer' => function($logEntry) use ($Record) {
                        return sprintf(
                            '%s user %s primary email to %s',
                            $logEntry['action'] == 'create' ? 'Setting' : 'Changing',
                            $Record->getTitle(),
                            $logEntry['record']->toString()
                        );
                    }
                ));
            }

            if ($logEntry) {
                if ($logEntry['action'] == 'create') {
                    $results['assigned-primary-email']++;
                } else {
                    $results['updated-primary-email']++;
                }
            }

            // set address with zip seperated
            /*
            if (!empty($row['Address'] && !empty($row['Zip']))) {
                $postalString = $row['Address'] . ', ' . $row['Zip'];

                if (!$Record->PrimaryPostal = Postal::getByString($postalString)) {
                    $primaryPostal = Postal::create();
                    $primaryPostal->loadString($postalString);
                    $Record->PrimaryPostal = $primaryPostal;
                    $Job->logRecordDelta($Record->PrimaryPostal, array(
                        'messageRenderer' => function($logEntry) use ($Record) {
                            return sprintf('Setting user %s primary postal to %s', $Record->getTitle(), $logEntry['record']->toString());
                        }
                    ));
                }
            }
            */

            // set phone
            /*
            if (!empty($row['Phone'])) {
                if (!$Record->PrimaryPhone = Phone::getByString($row['Phone'])) {
                    $primaryPhone = Phone::create();
                    $primaryPhone->loadString($row['Phone']);
                    $Record->PrimaryPhone = $primaryPhone;

                    $Job->logRecordDelta($Record->PrimaryPhone, array(
                        'messageRenderer' => function($logEntry) use ($Record) {
                            return sprintf('Setting user %s primary phone to %s', $Record->getTitle(), $logEntry['record']->toString());
                        }
                    ));
                }
            }
            */


            // emergency contact relationship
            /*
            if (!empty($row['EmergencyContact'])) {
                $guardianName = User::parseFullName($row['EmergencyContact']);
                $guardian = User::getOrCreateByFullName($guardianName['FirstName'], $guardianName['LastName']);
            }
            */


            // validate record
            if (!$Record->validate()) {
                $firstErrorField = key($Record->validationErrors);
                $error = $Record->validationErrors[$firstErrorField];
                $results['failed']['invalid'][$firstErrorField][is_array($error) ? http_build_query($error) : $error]++;
                $Job->logInvalidRecord($Record);
                continue;
            }


            // log changes
            $logEntry = $Job->logRecordDelta($Record, array(
                'labelRenderers' => array(
                    'AdvisorID' => 'Advisor'
                ),
                'valueRenderers' => array(
                    'AdvisorID' => function($advisorId) {
                        return $advisorId ? User::getByID($advisorId)->getTitle() : null;
                    }
                )
            ));

            if ($logEntry['action'] == 'create') {
                $results['created']++;
            } elseif ($logEntry['action'] == 'update') {
                $results['updated']++;
            }


            // save changes
            if (!$pretend) {
                $Record->save();
            }


            // assign to group
            if ($Record->GraduationYear && static::$studentRootGroup) {
                // get class group from cache or database
                $groupHandle = 'class_of_'.$Record->GraduationYear;
                $group = $groups[$groupHandle];

                if (!$group) {
                    $group = $groups[$groupHandle] = Group::getByHandle($groupHandle);
                }

                if (!$group) {
                    $parentGroup = $groups[static::$studentRootGroup];
                    
                    if (!$parentGroup) {
                        $parentGroup = $groups[static::$studentRootGroup] = Group::getByHandle(static::$studentRootGroup);
                    }
                    
                    if (!$parentGroup) {
                        $results['failed']['student-root-group-not-found']++;
                        $Job->log(sprintf('Student root group "%s" does not exist', static::$studentRootGroup), LogLevel::WARNING);
                        continue;
                    }
                    
                    $group = $groups[$groupHandle] = Group::create(array(
                        'Name' => 'Class of ' . $Record->GraduationYear,
                        'Parent' => $parentGroup
                    ), !$pretend);
                    
                    $Job->log(sprintf('Created graduation group for %s', $group->Name), LogLevel::NOTICE);
                }

                // get cohort group
                if (!empty($row['Group'])) {
                    $parentGroupHandle = $groupHandle;
                    $parentGroup = $group;

                    $groupHandle = "$parentGroupHandle/$row[Group]";
                    $group = $groups[$groupHandle];

                    if (!$group) {
                        $group = Group::getByWhere(array(
                            'ParentID' => $parentGroup->ID,
                            'Name' => $row['Group']
                        ));
                    }

                    if (!$group) {
                        $group = $groups[$groupHandle] = Group::create(array(
                            'Name' => $row['Group'],
                            'Parent' => $parentGroup
                        ), !$pretend);
                    
                        $Job->log(sprintf('Created cohort group %s in graduation group %s', $group->Name, $parentGroup->Name), LogLevel::NOTICE);
                    }
                }

                // find group
                $foundGroup = null;
                foreach ($Record->Groups AS $currentGroup) {
                    if ($currentGroup->Left >= $group->Left && $currentGroup->Right <= $group->Right) {
                        $foundGroup = $currentGroup;
                        break;
                    }
                }

                if (!$foundGroup) {
                    $Job->log(sprintf('add %s to group %s', $Record->getTitle(), $group->isPhantom ? $group->Name : $group->getFullPath()), LogLevel::NOTICE);

                    if (!$pretend) {
                        $group->assignMember($Record);
                    }

                    $results['addedToGroup']++;
                }
            }
        }


        return $results;
    }

    public static function pullStaff(Job $Job, $pretend = true, SpreadsheetReader $spreadsheet)
    {
        // check input
        static::_requireColumns('Staff', $spreadsheet, static::$staffRequiredColumns, static::$staffColumns);


        // initialize results
        $results = array(
            'analyzed' => 0
        );


        // loop through rows
        $groups = array();

        while ($row = $spreadsheet->getNextRow()) {
            $row = static::_readRow($row, static::$staffColumns);
            $Record = null;
            $results['analyzed']++;


            // check required fields
            if (empty($row['FirstName'])) {
                $results['failed']['missing-required-field']['FirstName']++;
                $Job->log(sprintf('Missing staff first name for row %u', $results['analyzed']), LogLevel::ERROR);
                continue;
            }

            if (empty($row['LastName'])) {
                $results['failed']['missing-required-field']['LastName']++;
                $Job->log(sprintf('Missing staff last name for row %u', $results['analyzed']), LogLevel::ERROR);
                continue;
            }

            $Job->log(sprintf('Row %03u - analyzing staff %s %s', $results['analyzed'], $row['FirstName'], $row['LastName']), LogLevel::DEBUG);


            // try to get teacher by username
            if (!empty($row['Username'])) {
                $Record = User::getByUsername($row['Username']);
            }

            // try to get by first+last name
            if (!$Record) {
                $Record = User::getByFullName($row['FirstName'], $row['LastName']);
            }

            // create user if not found
            if (!$Record) {
                $Record = User::create(array(
                    'AccountLevel' => 'Staff'
                ));
            }


            // apply values from spreadsheet
            if (!empty($row['AccountLevel']) && in_array($row['AccountLevel'], User::getFieldOptions('AccountLevel', 'values'))) {
                $Record->AccountLevel = $row['AccountLevel'];
                if ($Record->isPhantom) {
                    $Job->log(sprintf('Initializing staff AccountLevel to %s', $row['AccountLevel']), LogLevel::DEBUG);
                }
            }

            if (!$Record->About && !empty($row['Title'])) {
                $Record->About = $row['Title'];
            }

            $Record->FirstName = $row['FirstName'];
            $Record->LastName = $row['LastName'];

            if (!$Record->Username || !empty($Job->Config['updateUsernames'])) {
                if (!empty($row['Username'])) {
                    $Record->Username = $row['Username'];
                } else {
                    $domainConstraints = array();
                    if (!$Record->isPhantom) {
                        $domainConstraints[] = 'ID != ' . $Record->ID;
                    }

                    $Record->Username = User::getUniqueUsername($Record->FirstName, $Record->LastName, array(
                        'domainConstraints' => $domainConstraints
                    ));
                    
                    if ($Record->isPhantom) {
                        $Job->log(sprintf('Assigned username %s', $Record->Username), LogLevel::DEBUG);
                    }
                }
            }

            if (!empty($row['MiddleName'])) {
                $Record->MiddleName = $row['MiddleName'];
            }

            if (!empty($row['Gender'])) {
                if ($row['Gender'] == 'M') {
                    $Record->Gender = 'Male';
                } elseif ($row['Gender'] == 'F') {
                    $Record->Gender = 'Female';
                }
            }

            if (!empty($row['BirthDate'])) {
                $Record->BirthDate = strtotime($row['BirthDate']);
            }


            // assign email
            if (!empty($row['Email'])) {
                if (!$Record->PrimaryEmail = Email::getByString($row['Email'])) {
                    $Record->PrimaryEmail = Email::fromString($row['Email']);
                }
                $Record->PrimaryEmail->Label = 'Staff Email';

                $Record->ContactPoints = array_merge($Record->ContactPoints, array($Record->PrimaryEmail));
            } elseif (Slate::$userEmailDomain) {
                // if one is already set and updateUsernames are enabled, check if this contact point should be destroyed
                if ($Record->PrimaryEmail) {
                    $emailUsername = $Record->PrimaryEmail->getLocalName();
                    $emailDomain = $Record->PrimaryEmail->getDomainName();

                    if ($emailDomain == Slate::$userEmailDomain && $emailUsername != $Record->Username && !empty($Job->Config['updateUsernames'])) {
                        $Record->PrimaryEmail->loadString(Slate::generateUserEmail($Record));
                    }
                } else {
                    $Record->PrimaryEmail = Email::fromString(Slate::generateUserEmail($Record));
                    $Record->PrimaryEmail->Label = 'School Email';

                    $Record->ContactPoints = array_merge($Record->ContactPoints, array($Record->PrimaryEmail));
                    $Job->log(sprintf('Assigned auto-generated email address %o', $Record->PrimaryEmail) , LogLevel::DEBUG);
                }
            }

            if ($Record->PrimaryEmail) {
                $logEntry = $Job->logRecordDelta($Record->PrimaryEmail, array(
                    'messageRenderer' => function($logEntry) use ($Record) {
                        return sprintf(
                            '%s user %s primary email to %s',
                            $logEntry['action'] == 'create' ? 'Setting' : 'Changing',
                            $Record->getTitle(),
                            $logEntry['record']->toString()
                        );
                    }
                ));
            }

            if ($logEntry) {
                if ($logEntry['action'] == 'create') {
                    $results['assigned-primary-email']++;
                } else {
                    $results['updated-primary-email']++;
                }
            }

            // assign phone
            /*
            if (!empty($row['Phone'])) {
                if (!$Record->PrimaryPhone = Phone::getByString($row['Phone'])) {
                    $primaryPhone = Phone::create();
                    $primaryPhone->loadString($row['Phone']);
                    $Record->PrimaryPhone = $primaryPhone;

                    $Job->logRecordDelta($Record->PrimaryPhone, array(
                        'messageRenderer' => function($logEntry) use ($Record) {
                            return sprintf('Setting user %s primary phone to %s', $Record->getTitle(), $logEntry['record']->toString());
                        }
                    ));
                }
            }
            */

            // set address
            /*
            if (!empty($row['Address'])) {
                if (!$Record->PrimaryPostal = Postal::getByString($row['Address'])) {
                    $primaryPostal = Postal::create();
                    $primaryPostal->loadString($row['Address']);
                    $Record->PrimaryPostal = $primaryPostal;
                    $Job->logRecordDelta($Record->PrimaryPostal, array(
                        'messageRenderer' => function($logEntry) use ($Record) {
                            return sprintf('Setting user %s primary postal to %s', $Record->getTitle(), $logEntry['record']->toString());
                        }
                    ));
                }
            }
            */


            // validate record
            if (!$Record->validate()) {
                $firstErrorField = key($Record->validationErrors);
                $error = $Record->validationErrors[$firstErrorField];
                $results['failed']['invalid'][$firstErrorField][is_array($error) ? http_build_query($error) : $error]++;
                $Job->logInvalidRecord($Record);
                continue;
            }


            // log changes
            $logEntry = $Job->logRecordDelta($Record);

            if ($logEntry['action'] == 'create') {
                $results['created']++;
            } elseif ($logEntry['action'] == 'update') {
                $results['updated']++;
            }


            // save changes
            if (!$pretend) {
                $Record->save();
            }


            // determine new group
            if (!empty($row['AccountLevel']) && $row['AccountLevel'] == 'Teacher') {
                $groupHandle = 'teachers';
            } else {
                $groupHandle = 'staff';
            }

            $group = Group::getByHandle($groupHandle);

            if (!$group) {
                $results['failed']['group-not-found'][$groupHandle]++;
                $Job->log(sprintf('Could not add %s to group %s', $Record->getTitle(), $groupHandle), LogLevel::ERROR);
                continue;
            }

            // look for existing membership in group or sub-group
            $foundGroup = null;
            foreach ($Record->Groups AS $currentGroup) {
                if ($currentGroup->Left >= $group->Left && $currentGroup->Right <= $group->Right) {
                    $foundGroup = $currentGroup;
                    break;
                }
            }

            if (!$foundGroup) {
                $Job->log(sprintf('add %s to group %s', $Record->getTitle(), $group->getFullPath()), LogLevel::NOTICE);

                if (!$pretend) {
                    $group->assignMember($Record);
                }

                $results['added-to-group'][$groupHandle]++;
            }
        }


        return $results;
    }

    public static function pullSections(Job $Job, $pretend = true, SpreadsheetReader $spreadsheet)
    {
        // check input
        static::_requireColumns('Sections', $spreadsheet, static::$sectionRequiredColumns, static::$sectionColumns);

        if (empty($Job->Config['masterTerm'])) {
            throw new \Exception('masterTerm required to import sections');
        }

        if (!$MasterTerm = Term::getByHandle($Job->Config['masterTerm'])) {
            throw new \Exception('masterTerm not found');
        }


        // initialize results
        $results = array(
            'analyzed' => 0
        );


        // loop through rows
        while ($row = $spreadsheet->getNextRow()) {
            $row = static::_readRow($row, static::$sectionColumns);
            $Record = null;
            $Mapping = null;
            $results['analyzed']++;


            // check required fields
            if (empty($row['CourseCode'])) {
                $results['failed']['missing-required-field']['CourseCode']++;
                $Job->log(sprintf('Missing course code for row %u', $results['analyzed']), LogLevel::ERROR);
                continue;
            }

            if (empty($row['SectionExternal']) && empty($row['SectionCode'])) {
                $results['failed']['missing-required-field']['SectionCode']++;
                $Job->log(sprintf('Missing section code for row %u', $results['analyzed']), LogLevel::ERROR);
                continue;
            }

            $Job->log(sprintf('Row %03u - analyzing course section %s', $results['analyzed'], $row['Title']), LogLevel::DEBUG);


            // try to get existing section by mapping
            if (!empty($row['SectionExternal'])) {
                $externalIdentifier = sprintf('%s:%s', $MasterTerm->Handle, $row['SectionExternal']);

                $Mapping = Mapping::getByWhere(array(
                    'ContextClass' => Section::getStaticRootClass(),
                    'Connector' => static::getConnectorId(),
                    'ExternalKey' => 'section_id',
                    'ExternalIdentifier' => $externalIdentifier
                ));

                if ($Mapping) {
                    $Record = $Mapping->Context;
                }
            }

            // try to get existing section by code
            if (!$Record && !empty($row['SectionCode'])) {
                $Record = Section::getByCode($row['SectionCode']);
            }

            // create new section
            if (!$Record) {
                $Record = Section::create();
            }


            // get teacher, but add later
            $Teacher = null;
            if (!empty($row['TeacherUsername'])) {
                if (!$Teacher = User::getByUsername($row['TeacherUsername'])) {
                    $results['failed']['teacher-not-found-by-username'][$row['TeacherUsername']]++;
                    $Job->log(sprintf('Teacher not found for username "%s"', $row['TeacherUsername']), LogLevel::ERROR);
                    continue;
                }
            } elseif (!empty($row['TeacherFullName'])) {
                $teacherName = User::parseFullName($row['TeacherFullName']);
                if (!$Teacher = User::getByFullName($teacherName['FirstName'], $teacherName['LastName'])) {
                    $results['failed']['teacher-not-found-by-name'][$row['TeacherFullName']]++;
                    $Job->log(sprintf('Teacher not found for full name "%s"', $row['TeacherFullName']), LogLevel::ERROR);
                    continue;
                }
            }


            // apply values from spreadsheet
            if (!$Record->Course = Course::getByCode($row['CourseCode'])) {
                $Record->Course = Course::create(array(
                    'Code' => $row['CourseCode'],
                    'Title' => $row['CourseCode']
                ));
            }

            if (!empty($row['Term'])) {
                if (!$Record->Term = Term::getByHandle($row['Term'])) {
                    $results['failed']['term-not-found'][$row['Term']]++;
                    $Job->log(sprintf('Term not found for handle "%s"', $row['Term']), LogLevel::ERROR);
                    continue;
                }

                if ($Record->Term->Left < $MasterTerm->Left || $Record->Term->Left > $MasterTerm->Right) {
                    $results['failed']['term-outside-master'][$row['Term']]++;
                    $Job->log(sprintf('Term "%s" is not within the selected master term', $row['Term']), LogLevel::ERROR);
                    continue;
                }
            }

            if (!empty($row['Schedule'])) {
                $Record->Schedule = Schedule::getOrCreateByHandle($row['Schedule']);
            }

            if (!empty($row['Location'])) {
                $Record->Location = Location::getOrCreateByHandle('room-'.$row['Location'], 'Room '.$row['Location']);
            }

            if (!empty($row['StudentsCapacity'])) {
                $Record->StudentsCapacity = $row['StudentsCapacity'];
            }

            if (!empty($row['Notes'])) {
                $Record->Notes = $row['Notes'];
            }


            // set title
            $title = null;
            if (!empty($row['Title'])) {
                $title = $row['Title'];
            } elseif (!$Record->Title) {
                $title = $Record->Course->Code;
            }

            if ($title) {
                if (is_callable(static::$sectionTitleFormatter)) {
                    $title = call_user_func(static::$sectionTitleFormatter, $title, $Record, $Teacher);
                }

                $Record->Title = $title;
            }


            // validate record
            if (!$Record->validate()) {
                $firstErrorField = key($Record->validationErrors);
                $error = $Record->validationErrors[$firstErrorField];
                $results['failed']['invalid'][$firstErrorField][is_array($error) ? http_build_query($error) : $error]++;
                $Job->logInvalidRecord($Record);
                continue;
            }


            // log changes
            $logEntry = $Job->logRecordDelta($Record);

            if ($logEntry['action'] == 'create') {
                $results['created']++;
            } elseif ($logEntry['action'] == 'update') {
                $results['updated']++;
            }


            // save changes
            if (!$pretend) {
                $Record->save();
            }


            // save mapping
            if (!$Mapping && $externalIdentifier) {
                $Mapping = Mapping::create(array(
                    'Context' => $Record
                    ,'Source' => 'creation'
                    ,'Connector' => static::getConnectorId()
                    ,'ExternalKey' => 'section_id'
                    ,'ExternalIdentifier' => $externalIdentifier
                ), !$pretend);

                $Job->log(sprintf('mapping external identifier %s to section %s', $externalIdentifier, $Record->getTitle()), LogLevel::NOTICE);
            }


            // add teacher
            if ($Teacher) {
                $Participant = static::_getOrCreateParticipant($Record, $Teacher, 'Teacher', $pretend);
                $logEntry = static::_logParticipant($Job, $Participant);

                if ($logEntry['action'] == 'create') {
                    $results['teacher-enrollments-created']++;
                } elseif ($logEntry['action'] == 'update') {
                    $results['teacher-enrollments-updated']++;
                }
            }
        }


        return $results;
    }

    public static function pullEnrollments(Job $Job, $pretend = true, SpreadsheetReader $spreadsheet)
    {
        // check input
        static::_requireColumns('Enrollments', $spreadsheet, static::$enrollmentRequiredColumns, static::$enrollmentColumns);

        if (empty($Job->Config['masterTerm'])) {
            throw new \Exception('masterTerm required to import sections');
        }

        if (!$MasterTerm = Term::getByHandle($Job->Config['masterTerm'])) {
            throw new \Exception('masterTerm not found');
        }


        // initialize results
        $rostersBySection = array();
        $sectionsByIdentifier = array();
        $results = array(
            'analyzed-students' => 0,
            'analyzed-enrollments' => 0
        );


        // loop through rows for incoming roster
        while ($row = $spreadsheet->getNextRow()) {
            $row = static::_readRow($row, static::$enrollmentColumns);
            $Record = null;
            $results['analyzed-students']++;


            // check required fields
            if (empty($row['StudentNumber'])) {
                $results['failed']['missing-student-number']++;
                $Job->log(sprintf('Missing enrollment student number for row %u', $results['analyzed-students']), LogLevel::ERROR);
                continue;
            }

            $Job->log(sprintf('Row %03u - analyzing enrollment(s) for %s', $results['analyzed'], $row['StudentNumber']), LogLevel::DEBUG);


            // get student
            if (!$Student = Student::getByStudentNumber($row['StudentNumber'])) {
                $results['failed']['student-not-found'][$row['StudentNumber']]++;
                $Job->log(sprintf('Failed to lookup student by number for %s', $row['StudentNumber']), LogLevel::ERROR);
                continue;
            }


            // loop through every other column
            foreach ($row['_rest'] AS $sectionIdentifier) {
                if (!$sectionIdentifier) {
                    continue;
                }

                $Participant = null;
                $results['analyzed-enrollments']++;

                if (!$Section = $sectionsByIdentifier[$sectionIdentifier]) {
                    $externalIdentifier = sprintf('%s:%s', $MasterTerm->Handle, $sectionIdentifier);

                    $Mapping = Mapping::getByWhere(array(
                        'ContextClass' => Section::getStaticRootClass(),
                        'Connector' => static::getConnectorId(),
                        'ExternalKey' => 'section_id',
                        'ExternalIdentifier' => $externalIdentifier
                    ));

                    if ($Mapping) {
                        $Section = $sectionsByIdentifier[$sectionIdentifier] = $Mapping->Context;
                    } else {
                        $results['failed']['section-not-found'][$sectionIdentifier]++;
                        continue;
                    }
                }

                $Participant = static::_getOrCreateParticipant($Section, $Student, 'Student', $pretend);
                $logEntry = static::_logParticipant($Job, $Participant);

                if ($logEntry['action'] == 'create') {
                    $results['enrollments-created']++;
                } elseif ($logEntry['action'] == 'update') {
                    $results['enrollments-updated']++;
                }
            }
        }


        // TODO: remove stale enrollments


        return $results;
    }


    // protected methods
    protected static function _getOrCreateParticipant(Section $Section, User $User, $role, $pretend = true)
    {
        if ($pretend) {
            $Participant = SectionParticipant::getByWhere(array(
                'CourseSectionID' => $Section->ID,
                'PersonID' => $User->ID
            ));

            if ($Participant) {
                $Participant->Role = $role;
            }
        } else {
            $Participant = null;
        }

        if (!$Participant) {
            $Participant = SectionParticipant::create(array(
                'Section' => $Section,
                'Person' => $User,
                'Role' => $role
            ), !$pretend);
        }

        return $Participant;
    }

    protected static function _logParticipant(Job $Job, SectionParticipant $Participant)
    {
        return $Job->logRecordDelta($Participant, array(
            'messageRenderer' => function($logEntry) {
                $User = $logEntry['record']->Person;
                $Section = $logEntry['record']->Section;
                $Role = $logEntry['record']->Role;

                if ($logEntry['action'] == 'create') {
                    return sprintf('Adding user %s to section %s with role %s', $User->getTitle(), $Section->getTitle(), $Role);
                } else {
                    return sprintf('Updated user %s in section %s to role %s', $User->getTitle(), $Section->getTitle(), $Role);
                }
            }
        ));
    }
}