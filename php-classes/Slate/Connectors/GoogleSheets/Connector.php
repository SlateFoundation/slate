<?php

namespace Slate\Connectors\GoogleSheets;

use Slate;
use Slate\Term;

use Slate\People\Student;
use Emergence\People\User;
use Emergence\People\Groups\Group;
use Emergence\People\ContactPoint\Email;

use Emergence\Locations\Location;
use Slate\Courses\Course;
use Slate\Courses\Section;
use Slate\Courses\Schedule;
use Slate\Courses\SectionParticipant;

use SpreadsheetReader;
use Slate\Connectors\Job;
use Slate\Connectors\Mapping;


class Connector extends \Slate\Connectors\AbstractSpreadsheetConnector implements \Slate\Connectors\ISynchronize
{
    public static $title = 'Google Sheets';
    public static $connectorId = 'google-sheets';

    // column map
    public static $studentColumns = array(
        'School ID Number' => 'StudentNumber',
        'First Name' => 'FirstName',
        'Last Name' => 'LastName',
        'Middle Name' => 'MiddleName',
        'Gender' => 'Gender',
        'Birth Date' => 'BirthDate',
        'Graduation Year' => 'GraduationYear',
        'Cohort' => 'Group', 'Group' => 'Group',
#        'Advisor' => 'Advisor',
#        'Username',
#        'Assigned Password',
#        'Email',
#        'Phone',
#        'Postal Address'
    );

    public static $staffColumns = array(
        'First Name' => 'FirstName',
        'Last Name' => 'LastName',
        'Middle Name' => 'MiddleName',
        'Gender' => 'Gender',
        'Birth Date' => 'BirthDate',
#        'StaffID',
        'Username' => 'Username',
#        'Assigned Password',
        'Account Level' => 'AccountLevel',
        'Role / Job Title' => 'Title',
#        'Email',
#        'Phone',
#        'Postal Address'
    );

    public static $sectionColumns = array(
        'Section ID' => 'SectionExternal',
        'Section Code' => 'SectionCode',
        'Title' => 'Title',
        'Course Code' => 'CourseCode',
        'Teacher' => 'TeacherUsername',
        'Term' => 'Term',
        'Schedule' => 'Schedule',
        'Location' => 'Location',
        'Students Capacity' => 'StudentsCapacity',
        'Notes' => 'Notes'
    );
    
    public static $sectionTitleFormatter;

    public static $termMappings = array(
        '1234' => '',
        '12' => '.SEM1',
        '34' => '.SEM2'
    );

    public static $enrollmentColumns = array(
        'School ID Number' => 'StudentNumber'
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

        $config['studentsCsv'] = !empty($requestData['studentsCsv']) ? $requestData['studentsCsv'] : null;
        $config['staffCsv'] = !empty($requestData['staffCsv']) ? $requestData['staffCsv'] : null;
        $config['sectionsCsv'] = !empty($requestData['sectionsCsv']) ? $requestData['sectionsCsv'] : null;
        $config['enrollmentsCsv'] = !empty($requestData['enrollmentsCsv']) ? $requestData['enrollmentsCsv'] : null;

        $config['masterTerm'] = !empty($requestData['masterTerm']) ? $requestData['masterTerm'] : null;

        return $config;
    }

    public static function synchronize(Job $Job, $pretend = true, $verbose = false)
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
                $verbose,
                SpreadsheetReader::createFromStream(fopen($Job->Config['studentsCsv'], 'r'))
            );
        }

        if (!empty($Job->Config['staffCsv'])) {
            $results['pull-staff'] = static::pullStaff(
                $Job,
                $pretend,
                $verbose,
                SpreadsheetReader::createFromStream(fopen($Job->Config['staffCsv'], 'r'))
            );
        }

        if (!empty($Job->Config['sectionsCsv'])) {
            $results['pull-sections'] = static::pullSections(
                $Job,
                $pretend,
                $verbose,
                SpreadsheetReader::createFromStream(fopen($Job->Config['sectionsCsv'], 'r'))
            );
        }

        if (!empty($Job->Config['enrollmentsCsv'])) {
            $results['pull-enrollments'] = static::pullEnrollments(
                $Job,
                $pretend,
                $verbose,
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
    public static function pullStudents(Job $Job, $pretend = true, $verbose = false, SpreadsheetReader $spreadsheet)
    {
        // check input
        static::_requireColumns('Students', $spreadsheet, static::$studentRequiredColumns, static::$studentColumns);


        // initialize results
        $results = array(
            'analyzed' => 0
        );


        // loop through rows
        $groups = array();

        while ($row = $spreadsheet->getNextRow()) {
            $row = static::_readRow($row, static::$studentColumns);
            $Record = null;
            $results['analyzed']++;

            // check required fields
            if (empty($row['StudentNumber'])) {
                $results['failed']['studentNumberMissing']++;
                continue;
            }

            if (empty($row['FirstName'])) {
                $results['failed']['firstNameMissing']++;
                continue;
            }

            if (empty($row['LastName'])) {
                $results['failed']['lastNameMissing']++;
                continue;
            }


            // try to get existing student by school id #, or start creating a new record
            if (!$Record = Student::getByStudentNumber($row['StudentNumber'])) {
                $Record = Student::create(array(
        			'AccountLevel' => 'Student',
                    'StudentNumber' => $row['StudentNumber']
                ));
            }


            // apply values from spreadsheet
            $Record->FirstName = $row['FirstName'];
            $Record->LastName = $row['LastName'];
            
            if (!$Record->Username) {
                if (!empty($row['Username'])) {
                    $Record->Username = $row['Username'];
                } else {
                    $Record->Username = Student::getUniqueUsername($Record->FirstName, $Record->LastName);
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
            }


            // assign email
    		if (Slate::$userEmailDomain && !$Record->PrimaryEmail) {
				$Record->PrimaryEmail = EmailContactPoint::create(array(
					'Data' => 	$Record->Username.'@'.Slate::$userEmailDomain,
					'Label' => 'School Email'
				));
				
				$Record->ContactPoints = array_merge($Record->ContactPoints, array($Record->PrimaryEmail));
                
                $Job->logRecordDelta($Record->PrimaryEmail, array(
                	'messageRenderer' => function($logEntry) use ($Record) {
            			return sprintf('Setting user %s primary email to %s', $Record->getTitle(), $logEntry['record']->toString());
            		}
                ));
				$results['assigned-primary-email']++;
			}


            // validate record
            if (!$Record->validate()) {
                $firstErrorField = key($Record->validationErrors);
                $results['failed']['invalid'][$firstErrorField][$Record->validationErrors[$firstErrorField]]++;
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


            // assign to group
            if ($Record->GraduationYear) {
                // get class group from cache or database
                $group = $groups[$Record->GraduationYear];

                if (!$group) {
                    $group = $groups[$Record->GraduationYear] = Group::getByHandle('class_of_'.$Record->GraduationYear);
                }

                if (!$group) {
                    $results['failed']['graduationGroupNotFound'][$Record->GraduationYear]++;
                    continue;
                }

                // get cohort group
                if (!empty($row['Group'])) {
                    $group = Group::getByWhere(array(
                        'ParentID' => $group->ID,
                        'Name' => $row['Group']
                    ));

                    if (!$group) {
                        $results['failed']['cohortGroupNotFound'][$Record->GraduationYear.'/'.$row['Group']]++;
                        continue;
                    }
                }

                // find group
                $foundGroup = null;
                foreach ($Record->Groups AS $Group) {
                    if ($Group->Left >= $group->Left && $Group->Right <= $group->Right) {
                        $foundGroup = $Group;
                        break;
                    }
                }
                
                if (!$foundGroup) {
                    $Job->log(sprintf('add %s to group %s', $Record->getTitle(), $group->getFullPath()));

                    if (!$pretend) {
                        $group->assignMember($Record);
                    }

                    $results['addedToGroup']++;
                }
            }
		}

        
        return $results;
    }

    public static function pullStaff(Job $Job, $pretend = true, $verbose = false, SpreadsheetReader $spreadsheet)
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
                $results['failed']['firstNameMissing']++;
                continue;
            }

            if (empty($row['LastName'])) {
                $results['failed']['lastNameMissing']++;
                continue;
            }


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
            }
            
            if (!$Record->About && !empty($row['Title'])) {
                $Record->About = $row['Title'];
            }

            $Record->FirstName = $row['FirstName'];
            $Record->LastName = $row['LastName'];
            
            if (!$Record->Username) {
                if (!empty($row['Username'])) {
                    $Record->Username = $row['Username'];
                } else {
                    $Record->Username = User::getUniqueUsername($Record->FirstName, $Record->LastName);
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


            // validate record
            if (!$Record->validate()) {
                $firstErrorField = key($Record->validationErrors);
                $results['failed']['invalid'][$firstErrorField][$Record->validationErrors[$firstErrorField]]++;
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


            // TODO: add to groups
		}

        
        return $results;
    }

    public static function pullSections(Job $Job, $pretend = true, $verbose = false, SpreadsheetReader $spreadsheet)
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
                $results['failed']['courseCodeMissing']++;
                continue;
            }
            
            if (empty($row['SectionExternal']) && empty($row['SectionCode'])) {
                $results['failed']['codeAndIdMissing']++;
                continue;
            }


            // try to get existing section by mapping
            if (!empty($row['SectionExternal'])) {
                $externalIdentifier = sprintf('%s:%s', $MasterTerm->Handle, $row['SectionExternal']);
                
                $Mapping = Mapping::getByWhere(array(
        			'ContextClass' => 'Slate\Courses\Section',
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
                    $results['failed']['teacherNotFound'][$row['TeacherUsername']]++;
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
                $termHandle = $row['Term'];

                if (array_key_exists($termHandle, static::$termMappings)) {
                    $termHandle = static::$termMappings[$termHandle];
                }

                $termHandle = $MasterTerm->Handle . $termHandle;
                if (!$Record->Term = Term::getByHandle($termHandle)) {
                    $results['failed']['termNotFound'][$termHandle]++;
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
                $results['failed']['invalid'][$firstErrorField][$Record->validationErrors[$firstErrorField]]++;
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
                    ,'MappingSource' => 'Creation'
                    ,'Connector' => static::getConnectorId()
                    ,'ExternalKey' => 'section_id'
                    ,'ExternalIdentifier' => $externalIdentifier
                ), !$pretend);

                $Job->log(sprintf('mapping external identifier %s to section %s', $externalIdentifier, $Record->getTitle()));
            }


            // add teacher
            if ($Teacher) {
                $Participant = static::_getOrCreateParticipant($Record, $Teacher, 'Instructor', $pretend);
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

    public static function pullEnrollments(Job $Job, $pretend = true, $verbose = false, SpreadsheetReader $spreadsheet)
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
                continue;
            }


            // get student
            if (!$Student = Student::getByStudentNumber($row['StudentNumber'])) {
                $results['failed']['student-not-found'][$row['StudentNumber']]++;
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
                		'ContextClass' => 'Slate\Courses\Section',
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


        // remove stale enrollments


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