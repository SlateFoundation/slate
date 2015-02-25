<?php

namespace Slate\Connectors;

use Slate;
use SpreadsheetReader;
use Emergence\Connectors\Job;
use Emergence\Connectors\Mapping;
use Emergence\Connectors\Exceptions\RemoteRecordInvalid;
use Emergence\Util\Capitalizer;
use Psr\Log\LogLevel;

use Slate\People\Student;
use Emergence\People\User;
use Emergence\People\Person;
use Emergence\People\Relationship;
use Emergence\People\Groups\Group;
use Emergence\People\Groups\GroupMember;
use Emergence\People\ContactPoint\Email;
use Emergence\People\ContactPoint\Phone;
use Emergence\People\ContactPoint\Postal;

use Slate\Term;
use Slate\Courses\Course;
use Slate\Courses\Section;
use Slate\Courses\SectionParticipant;
use Slate\Courses\Schedule;
use Emergence\Locations\Location;


class AbstractSpreadsheetConnector extends \Emergence\Connectors\AbstractSpreadsheetConnector
{
    // ExternalKey values for mappings read into ForeignKey columns
    public static $personForeignKeyName = 'person[foreign_key]';
    public static $sectionForeignKeyName = 'section[foreign_key]';


    // group assignments
    public static $studentsRootGroup = 'students';
    public static $alumniRootGroup = 'alumni';
    public static $staffRootGroup = 'staff';
    public static $teachersRootGroup = 'teachers';
    public static $parentsRootGroup = 'parents';

    // Look up columns
    public static $studentLookUpColumns;
    public static $parentLookUpColumns = ['Email', 'FullName']; // Tyler - recommend we remove full name from look up, not unique enough
    public static $staffLookUpColumns;


    // workflow callable overrides
    public static $sectionTitleFormatter;
    public static $onUserNotFound;
    public static $onApplyUserChanges;

    public static $onBeforeValidateRecord;
    public static $onValidateRecord;
    public static $onBeforeSaveRecord;
    public static $onSaveRecord = 'onRecordSave';

    public static $addNewStudentsRecords = true;
    public static $addNewParentRecords = true;
    public static $addNewStaffRecords = true;

    // column maps
    public static $studentColumns = array(
        'Key' => 'ForeignKey',
        'School ID Number' => 'StudentNumber',
            'Student ID' => 'StudentNumber',
        'PHONE_NO' => 'Phone',
        'Username' => 'Username',
        'Email' => 'Email',
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
#        'Assigned Password',
#        'Email',
#        'Phone',
#        'Postal Address'
    );
    
    public static $parentColumns = array(
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

        'Username' => 'Username',
        'Relationship' => 'Relationship'
    );

    public static $alumniColumns = array(
        'Username' => 'Username',
        'Email' => 'Email',
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
            'Graduation' => 'GraduationYear'
    );

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
        'Role / Job Title' => 'About',
        'Email' => 'Email',
#        'Phone',
#        'Postal Address'
    );

    public static $sectionColumns = array(
        'Section ID' => 'SectionExternal',
        'Section Code' => 'SectionCode',
            'Section code' => 'SectionCode',
        'Title' => 'Title',
        'Course Code' => 'CourseCode',
            'Course code' => 'CourseCode',
        'Teacher' => 'TeacherUsername',
        'Term' => 'Term',
            'Terms' => 'Term',
        'Schedule' => 'Schedule',
        'Location' => 'Location',
            'Room' => 'Location',
        'Students Capacity' => 'StudentsCapacity',
            '# of Students' => 'StudentsCapacity',
            'Seats' => 'StudentsCapacity',
        'Notes' => 'Notes'
    );

    public static $enrollmentColumns = array(
        'School ID Number' => 'StudentNumber',
            'School ID' => 'StudentNumber',
            'Student Number' => 'StudentNumber'
    );


    // minimum required columns
    public static $studentRequiredColumns = array(
        'StudentNumber',
        'FirstName',
        'LastName'
    );
    
    public static $parentRequiredColumns = [];
    public static $parentRequiredFields = [
        'FirstName',
        'LastName'
    ];

    public static $alumniRequiredColumns = array(
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
        $config['updateAbout'] = !empty($requestData['updateAbout']);
        $config['autoAssignEmail'] = !empty($requestData['autoAssignEmail']);
        $config['masterTerm'] = !empty($requestData['masterTerm']) ? $requestData['masterTerm'] : null;
        $config['enrollmentDelimiter'] = !empty($requestData['enrollmentDelimiter']) ? $requestData['enrollmentDelimiter'] : null;

        return $config;
    }


    // task handlers
    public static function pullStudents(Job $Job, $pretend = true, SpreadsheetReader $spreadsheet, $hardFindFields = array())
    {   
        echo "Starting to pull students from abstract \n";

        // check input
        static::_requireColumns('students', $spreadsheet, static::$studentRequiredColumns, static::$studentColumns);


        // initialize results
        $results = array(
            'analyzed' => 0
        );

        // loop through rows
        while ($row = $spreadsheet->getNextRow()) {

            // process input row through column mapping
            $row = static::_readRow($row, static::$studentColumns);
            // start logging analysis
            $results['analyzed']++;
            static::_logRow($Job, 'student', $results['analyzed'], $row);

            // get existing user or start creating a new one
            if (!$Record = static::_getPerson($Job, $row, static::$studentLookUpColumns)) {
                if (!static::$addNewStudentsRecords){
                    $results['studentCreationSkipped']++;
                    continue;
                } else {
                    $Record = Student::create();
                }
            }

            // apply values from spreadsheet
            try {
                static::_applyUserChanges($Job, $Record, $row, $results);
            } catch (RemoteRecordInvalid $e) {
                if ($e->getValueKey()) {
                    $results['failed'][$e->getMessageKey()][$e->getValueKey()]++;
                } else {
                    $results['failed'][$e->getMessageKey()]++;
                }
                $Job->log($e->getMessage(), LogLevel::ERROR);
                continue;
            }

            // validate record
            if (!static::_validateRecord($Job, $Record, $results)) {
                continue;
            }
                
            // save record
            static::_saveRecord($Job, $Record, $pretend, $results, static::_getPersonLogOptions());
        }
        var_dump($results);
        return $results;
    }
    
 
    // task handlers
    public static function pullParents(Job $Job, $pretend = true, SpreadsheetReader $spreadsheet, $hardFindFields = array())
    {   
        echo "Starting to pull parents from abstract \n";

        // check input
        static::_requireColumns('parents', $spreadsheet, static::$parentRequiredColumns, static::$parentColumns);

        
        // initialize results
        $results = array(
            'analyzed' => 0
        );
        // loop through rows
        while ($row = $spreadsheet->getNextRow()) {

            // process input row through column mapping
            $row = static::_readRow($row, static::$parentColumns, static::$parentRequiredFields);
            // start logging analysis
            $results['analyzed']++;
            static::_logRow($Job, 'parent', $results['analyzed'], $row);

            // get existing user or start creating a new one
            
            if(!array_key_exists('_rest', $row)) {

                foreach($row as $index => $subRow) {
                    $subRow['Group'] = 'Parents';
                    static::_saveRow($Job, $subRow, static::$parentLookUpColumns, $results, $pretend);
                }

                continue;
            }
            $row['Group'] = 'Parents';
            static::_saveRow($Job, $row, static::$parentLookUpColumns, $results, $pretend);
        }
        return $results;
    }

    public static function pullAlumni(Job $Job, $pretend = true, SpreadsheetReader $spreadsheet)
    {
        // check input
        static::_requireColumns('alumni', $spreadsheet, static::$alumniRequiredColumns, static::$alumniColumns);

        // initialize results
        $results = array(
            'analyzed' => 0
        );


        // loop through rows
        while ($row = $spreadsheet->getNextRow()) {

            // process input row through column mapping
            $row = static::_readRow($row, static::$alumniColumns);


            // start logging analysis
            $results['analyzed']++;
            static::_logRow($Job, 'alumni', $results['analyzed'], $row);


            // get existing user or start creating a new one
            if (!$Record = static::_getPerson($Job, $row)) {
                $Record = Student::create();
            }


            // apply values from spreadsheet
            try {
                static::_applyUserChanges($Job, $Record, $row, $results);
            } catch (RemoteRecordInvalid $e) {
                if ($e->getValueKey()) {
                    $results['failed'][$e->getMessageKey()][$e->getValueKey()]++;
                } else {
                    $results['failed'][$e->getMessageKey()]++;
                }

                $Job->log($e->getMessage(), LogLevel::ERROR);
                continue;
            }


            // validate record
            if (!static::_validateRecord($Job, $Record, $results)) {
                continue;
            }


            // save record
            static::_saveRecord($Job, $Record, $pretend, $results, static::_getPersonLogOptions());
        }

        var_dump($results);
        return $results;
    }

    public static function pullStaff(Job $Job, $pretend = true, SpreadsheetReader $spreadsheet)
    {
        // check input
        static::_requireColumns('staff', $spreadsheet, static::$staffRequiredColumns, static::$staffColumns);

        // initialize results
        $results = array(
            'analyzed' => 0
        );


        // loop through rows
        while ($row = $spreadsheet->getNextRow()) {

            // process input row through column mapping
            $row = static::_readRow($row, static::$staffColumns);


            // start logging analysis
            $results['analyzed']++;
            static::_logRow($Job, 'staff', $results['analyzed'], $row);


            // get existing user or start creating a new one
            if (!$Record = static::_getPerson($Job, $row, static::$staffLookUpColumns)) {
                if (!static::$addNewStaffRecords) {
                    $results['skippedStaffCreation']++;
                    continue;
                } else {
                     $Record = User::create(array(
                        'AccountLevel' => 'Staff'
                    ));   
                }
            }


            // apply values from spreadsheet
            try {
                static::_applyUserChanges($Job, $Record, $row, $results);
            } catch (RemoteRecordInvalid $e) {
                if ($e->getValueKey()) {
                    $results['failed'][$e->getMessageKey()][$e->getValueKey()]++;
                } else {
                    $results['failed'][$e->getMessageKey()]++;
                }

                $Job->log($e->getMessage(), LogLevel::ERROR);
                continue;
            }


            // validate record
            if (!static::_validateRecord($Job, $Record, $results)) {
                continue;
            }


            // save record
            static::_saveRecord($Job, $Record, $pretend, $results, static::_getPersonLogOptions());
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
                    'ExternalKey' => static::$sectionForeignKeyName,
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
            } else {
                $results['unmodified']++;
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
                    ,'ExternalKey' => static::$sectionForeignKeyName
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
            'analyzed' => 0,
            'analyzed-enrollments' => 0
        );


        // loop through rows for incoming roster
        while ($row = $spreadsheet->getNextRow()) {
            $row = static::_readRow($row, static::$enrollmentColumns);
            $Record = null;
            $results['analyzed']++;


            // check required fields
            if (empty($row['StudentNumber'])) {
                $results['failed']['missing-student-number']++;
                $Job->log(sprintf('Missing enrollment student number for row %u', $results['analyzed']), LogLevel::ERROR);
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
                    
                    // Optionally split code based user value
                    if (!$Job->Config['enrollmentDelimiter']) {
                        $codes = array($sectionIdentifier);
                    } else {
                        $codes = explode($Job->Config['enrollmentDelimiter'], $sectionIdentifier);
                    }

                    foreach ($codes as $code) {                        
                        $externalIdentifier = sprintf('%s:%s', $MasterTerm->Handle, $code);
                        $Mapping = Mapping::getByWhere(array(
                            'ContextClass' => Section::getStaticRootClass(),
                            'Connector' => static::getConnectorId(),
                            'ExternalKey' => 'section_id',
                            'ExternalIdentifier' => $externalIdentifier
                        ));

                        if ($Mapping) {
                            $Section = $sectionsByIdentifier[$code] = $Mapping->Context;
                        } else {
                            $results['failed']['section-not-found'][$code]++;
                            continue;
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
            }
        }

        // TODO: remove stale enrollments

        return $results;
    }


    // protected methods
    protected static function _getPerson(Job $Job, array $row, $lookUpColumns = null)
    {
        if ($lookUpColumns) {
            foreach ($lookUpColumns as $field) {
                if($field == 'FullName') {
                    $fieldValue = !empty($row[$field]) ? $row[$field] : $row['FirstName'].' '.$row['LastName'];
                } else {
                    $fieldValue = $row[$field];
                }
                
                if (!empty($fieldValue)) {
                    
                    if ($field == 'StudentNumber') {
                        $User = Student::getByField($field, $fieldValue);
                    } else if ($field == 'Email') {
                        $User = Email::getByString($fieldValue) ? Email::getByString($fieldValue)->Person : null;

                    } else if ($field == 'FullName') {
                        try {
                            $splitName = Person::parseFullName($fieldValue);

                            $User = Person::getByFullName($splitName['FirstName'], $splitName['LastName']);
                        } catch (\Exception $e) {
                            continue;
                        }
                    } else {
                        $User = User::getByField($field, $row[$field]);
                    }
                    if ($User) {
                        return $User;
                    }
                }
            }
            return null;
        } 
        
        // try to get existing account by foreign key column
        if (!empty($row['ForeignKey'])) {
            $Mapping = Mapping::getByWhere(array(
                'ContextClass' => User::getStaticRootClass(),
                'Connector' => static::getConnectorId(),
                'ExternalKey' => static::$personForeignKeyName,
                'ExternalIdentifier' => $row['ForeignKey']
            ));

            if ($Mapping) {
                return $Mapping->Context;
            }
        }

        // try to get existing account by StudentNumber
        if (!empty($row['StudentNumber']) && ($User = Student::getByStudentNumber($row['StudentNumber']))) {
            return $User;
        }


        // try to get existing account by Username
        if (!empty($row['Username']) && ($User = User::getByUsername($row['Username']))) {
            return $User;
        }


        // try to get existing account by Email Address or Email-derived username
        if (!empty($row['Email'])) {
            // see if email is known and matches a user's contact point
            if ($EmailContactPoint = Email::getByString($row['Email'])) {
                return $EmailContactPoint->Person;
            }

            // check if the domain matches the user email domain and try a username lookup
            list ($emailLocal, $emailDomain) = explode('@', $row['Email'], 2);
            if (strcasecmp($emailDomain, Slate::$userEmailDomain) == 0 && ($User = User::getByUsername($emailLocal))) {
                return $User;
            }
        }

        // @TODO - This seems excessive -> why 
        // try to get existing user by full name
        if (!empty($row['FirstName']) && !empty($row['LastName']) && ($User = User::getByFullName($row['FirstName'], $row['LastName'])) && (!empty($row['FullName']) && $splitName = Person::parseFullName($row['FullName']) && $User = User::getByFullName($splitName[0], $splitName[1]))) {
            return $User;
        }


        // call configurable hook
        if (is_callable(static::$onUserNotFound)) {
            return call_user_func(static::$onUserNotFound, $Job, $row);
        }


        return null;
    }

    protected static function _applyUserChanges(Job $Job, Person $User, array $row, array &$results)
    {
        $currentGraduationYear = date('Y', strtotime(static::_getCurrentMasterTerm($Job)->EndDate));
        $autoCapitalize = $Job->Config['autoCapitalize'];
        $_formatPronoun = function($string, $familyName = false) use ($autoCapitalize) {
            return $autoCapitalize ? Capitalizer::capitalizePronoun($string, $familyName) : $string;
        };

        // apply name
        if (!empty($row['FirstName'])) {
            $User->FirstName = $_formatPronoun($row['FirstName']);
        }

        if (!empty($row['LastName'])) {
            $User->LastName = $_formatPronoun($row['LastName'], true); // true to apply extra rules for family names
        }
 
        if (!empty($row['MiddleName'])) {
            $User->MiddleName = $_formatPronoun($row['MiddleName']);
        }

        if (!empty($row['FullName'])) {  
            try {
                $splitName = Person::parseFullName($row['FullName']);
    
                $User->FirstName = $_formatPronoun($splitName['FirstName']);
                $User->MiddleName = $_formatPronoun($splitName['MiddleName']);
                $User->LastName = $_formatPronoun($splitName['LastName'], true); 
            } catch (\Exception $e) {
                throw new RemoteRecordInvalid(
                    'person-fullname-incorrect',
                    $e->getMessage,
                    $row
                );
            }
        }

        // apply account
        if (!$User->Username || !empty($Job->Config['updateUsernames'])) {
            if (!empty($row['Username'])) {
                $User->Username = $row['Username'];
            } else {
                $domainConstraints = array();
                if (!$User->isPhantom) {
                    $domainConstraints[] = 'ID != ' . $User->ID;
                }

                $User->Username = User::getUniqueUsername($User->FirstName, $User->LastName, array(
                    'domainConstraints' => $domainConstraints
                ));

                if ($User->isPhantom) {
                    $Job->log(sprintf('Assigned username %s', $User->Username), LogLevel::DEBUG);
                }
            }
        }

        if (!empty($row['AccountLevel']) && in_array($row['AccountLevel'], User::getFieldOptions('AccountLevel', 'values'))) {
            $User->AccountLevel = $row['AccountLevel'];
            if ($User->isPhantom) {
                $Job->log(sprintf('Initializing AccountLevel to %s', $row['AccountLevel']), LogLevel::DEBUG);
            }
        }


        // apply demographic data
        if (!empty($row['Gender'])) {
            if ($row['Gender'] == 'M') {
                $User->Gender = 'Male';
            } elseif ($row['Gender'] == 'F') {
                $User->Gender = 'Female';
            }
        }

        if (!empty($row['BirthDate'])) {
            $User->BirthDate = strtotime($row['BirthDate']);
        }

        if (!empty($row['SchoolID'])) {
            $User->SchoolID = $row['SchoolID'];
        }

        if (!empty($row['About']) && (!$User->About || !empty($Job->Config['updateAbout']))) {
            $User->About = $row['About'];
        }

        // apply home language
        if (!empty($row['HomeLanguage'])) {
            $User->HomeLanguage = $row['HomeLanguage'];
        }

        // apply school data
        if (!empty($row['StudentNumber']) && empty($row['Relationship'])) {
            $User->StudentNumber = $row['StudentNumber'];
        }

        $importedGraduationYear = null;
        if (!empty($row['GraduationYear'])) {
            $User->GraduationYear = $importedGraduationYear = $row['GraduationYear'];
        } elseif (!empty($row['Grade'])) {
            $User->GraduationYear = $importedGraduationYear = $currentGraduationYear + (12 - $row['Grade']);
        }

        if ($importedGraduationYear && !$User->isA(Student::class)) {
            throw new RemoteRecordInvalid(
                'not-a-student',
                sprintf('Tried to set GraduationYear=%u on user %s, but user is not a student', $importedGraduationYear, $User->getTitle()),
                $row
            );
        }

        if (!empty($row['AdvisorUsername'])) {
            if (!$User->Advisor = User::getByUsername($row['AdvisorUsername'])) {
                throw new RemoteRecordInvalid(
                    'advisor-not-found-by-username',
                    sprintf('Advisor not found for username "%s"', $row['AdvisorUsername']),
                    $row,
                    $row['AdvisorUsername']
                );
            }
        } elseif (!empty($row['AdvisorForeignKey'])) {
            $Mapping = Mapping::getByWhere(array(
                'ContextClass' => User::getStaticRootClass(),
                'Connector' => static::getConnectorId(),
                'ExternalKey' => static::$personForeignKeyName,
                'ExternalIdentifier' => $row['AdvisorForeignKey']
            ));

            if (!$Mapping) {
                throw new RemoteRecordInvalid(
                    'advisor-not-found-by-foreign-key',
                    sprintf('Advisor not found for foreign key "%s"', $row['AdvisorForeignKey']),
                    $row,
                    $row['AdvisorForeignKey']
                );
            }

            $User->Advisor = $Mapping->Context;
        }


        // apply email address
        if (!empty($row['Email'])) {
            if (!$User->PrimaryEmail = Email::getByString($row['Email'])) {
                $User->PrimaryEmail = Email::fromString($row['Email']);
                $User->PrimaryEmail->Label = 'Imported Email';
            }

            $User->ContactPoints = array_merge($User->ContactPoints, array($User->PrimaryEmail));
        } elseif (!$User->isA(Person::class) && Slate::$userEmailDomain && $Job->Config['autoAssignEmail']) {
            // if one is already set and updateUsernames is enabled, check if this contact point should be updated
            if ($User->PrimaryEmail) {
                $emailUsername = $User->PrimaryEmail->getLocalName();
                $emailDomain = $User->PrimaryEmail->getDomainName();

                if ($emailDomain == Slate::$userEmailDomain && $emailUsername != $User->Username && $Job->Config['updateUsernames']) {
                    $User->PrimaryEmail->loadString(Slate::generateUserEmail($User));
                }
            } else {
                $User->PrimaryEmail = Email::fromString(Slate::generateUserEmail($User));
                $User->PrimaryEmail->Label = 'School Email';

                $User->ContactPoints = array_merge($User->ContactPoints, array($User->PrimaryEmail));
                $Job->log(sprintf('Assigned auto-generated email address %o', $User->PrimaryEmail) , LogLevel::DEBUG);
            }
        }

        if ($User->PrimaryEmail) {
            $logEntry = $Job->logRecordDelta($User->PrimaryEmail, array(
                'messageRenderer' => function($logEntry) use ($User) {
                    return sprintf(
                        '%s user %s primary email to %s',
                        $logEntry['action'] == 'create' ? 'Setting' : 'Changing',
                        $User->getTitle(),
                        $logEntry['record']->toString()
                    );
                }
            ));

            if ($logEntry) {
                if ($logEntry['action'] == 'create') {
                    $results['assigned-primary-email']++;
                } else {
                    $results['updated-primary-email']++;
                }
            }
        }
        
        // set phone
        // Modofiy to not set primary but instead add contact point to user and it will set primary for us.
        // create mapping record, if it exists, then update if not then don't 
        if (!empty($row['Phone'])) {     
            $primaryPhone = $User->PrimaryPhoneID ? $User->PrimaryPhone : Phone::create();
            $tmpPhone = $primaryPhone->number;
            $primaryPhone->loadString($row['Phone']);
            
            if($primaryPhone->validate() && $tmpPhone != $primaryPhone->number) {
                $User->PrimaryPhone = $primaryPhone;
                $User->ContactPoints = array_merge($User->ContactPoints, array($User->PrimaryPhone));
                
                $logEntry = $Job->logRecordDelta($User->PrimaryPhone, array(
                    'messageRenderer' => function($logEntry) use ($User) {
                        return sprintf(
                            '%s user %s primary phone to %s',
                            $logEntry['action'] == 'create' ? 'Setting' : 'Changing',
                            $User->getTitle(),
                            $logEntry['record']->toString()
                        );
                    }
                ));
    
                if ($logEntry) {
                    if ($logEntry['action'] == 'create') {
                        $results['assigned-primary-phone']++;
                    } else {
                        $results['updated-primary-phone']++;
                    }
                }
            }
        }

        // check if specific address already exists for the user
        // if it does skip
        // if it doesn't look for mapping 
        // if mapping -> update 
        // if !mapping -> create new record and mapping
        // Goes for address and phone.
        
        // set address with zip seperated
        if (!empty($row['Address'])) {
            $primaryPostal = $User->PrimaryPostalID ? $User->PrimaryPostal : Postal::create();
            
            $tmpAddress = $primaryPostal->toArray();

            $primaryPostal->loadString($row['Address']); 
            
            if(!empty($row['City'])) {
                $primaryPostal->city = ucfirst(strtolower($row['City']));
            }
            
            if(!empty($row['State'])) {
                $primaryPostal->state = $row['State'];
            }
            
            if(!empty($row['Unit'])) {
                $primaryPostal->unit = $row['Unit'];
            }
            
            if(!empty($row['Postal'])) {
                $primaryPostal->postal = $row['Postal'];
            }
            
            if($primaryPostal->validate() && $tmpAddress != $primaryPostal->toArray()) {
                $User->PrimaryPostal = $primaryPostal;
                $User->ContactPoints = array_merge($User->ContactPoints, array($User->PrimaryPostal));
                
                $logEntry = $Job->logRecordDelta($User->PrimaryPostal, array(
                    'messageRenderer' => function($logEntry) use ($User) {
                        return sprintf(
                            '%s user %s primary postal to %s',
                            $logEntry['action'] == 'create' ? 'Setting' : 'Changing',
                            $User->getTitle(),
                            $logEntry['record']->toString()
                        );
                    }
                ));
    
                if ($logEntry) {
                    if ($logEntry['action'] == 'create') {
                        $results['assigned-primary-postal']++;
                    } else {
                        $results['updated-primary-postal']++;
                    }
                }
            }
        }
        // emergency contact relationship
        
        // determine primary group
        $primaryGroup = null;

        if ($User->GraduationYear && static::$studentsRootGroup) {
            // get class group from cache or database
            $groupHandle = 'class_of_'.$User->GraduationYear;

            if (!$primaryGroup = Group::getByHandle($groupHandle)) {
                $parentGroupHandle = $User->GraduationYear >= $currentGraduationYear ? static::$studentsRootGroup : static::$alumniRootGroup;
                if (!$parentGroup = Group::getByHandle($parentGroupHandle)) {
                    throw new RemoteRecordInvalid(
                        'student-root-group-not-found',
                        sprintf('Student root group "%s" does not exist', $parentGroupHandle),
                        $row,
                        $parentGroupHandle
                    );
                }

                $primaryGroup = Group::create(array(
                    'Name' => 'Class of ' . $User->GraduationYear,
                    'Parent' => $parentGroup
                ));

                $Job->log(sprintf('create graduation group for %s', $primaryGroup->Name), LogLevel::NOTICE);
            }

            // if Group is set, get or create as subgroup of graduation group
            if (!empty($row['Group'])) {
                $parentGroup = $primaryGroup;

                $primaryGroup = Group::getByWhere(array(
                    'ParentID' => $parentGroup->ID,
                    'Name' => $row['Group']
                ));

                if (!$primaryGroup) {
                    $primaryGroup = Group::create(array(
                        'Name' => $row['Group'],
                        'Parent' => $parentGroup
                    ));

                    $Job->log(sprintf('create group %s in graduation group %s', $primaryGroup->Name, $parentGroup->Name), LogLevel::NOTICE);
                }
            }
        } elseif (!$User->isA(Person::class) && $User->hasAccountLevel('Staff') && static::$staffRootGroup) {
            $groupHandle = $User->AccountLevel == 'Teacher' ? static::$teachersRootGroup : static::$staffRootGroup;
            $primaryGroup = Group::getByHandle($groupHandle);

            if (!$primaryGroup) {
                throw new RemoteRecordInvalid(
                    'staff-root-group-not-found',
                    sprintf('Staff root group "%s" does not exist', $groupHandle),
                    $row,
                    $groupHandle
                );
            }
        } elseif ($User->isA(Person::class) && $row['Group'] == 'Parents' && static::$parentsRootGroup) {
            $primaryGroup = Group::getByHandle(static::$parentsRootGroup);

            if (!$primaryGroup) {
                throw new RemoteRecordInvalid(
                    'parent-root-group-not-found',
                    sprintf('Parent root group "%s" does not exist', $groupHandle),
                    $row,
                    $groupHandle
                );
            }
        }

        if ($primaryGroup) {
            // check if user is already in the determined primary group or a subgroup of it
            $foundGroup = null;
            foreach ($User->Groups AS $currentGroup) {
                if ($currentGroup->Left >= $primaryGroup->Left && $currentGroup->Right <= $primaryGroup->Right) {
                    $foundGroup = $currentGroup;
                    break;
                }
            }

            // assign to determined group if needed
            if (!$foundGroup) {
                $Job->log(sprintf('add %s to group %s', $User->getTitle(), $primaryGroup->isPhantom ? $primaryGroup->Name : $primaryGroup->getFullPath()), LogLevel::NOTICE);
                $membership = GroupMember::create(array(
                    'Group' => $primaryGroup
                ));
                $User->GroupMemberships = array_merge($User->GroupMemberships, array($membership));
                $results['added-to-group'][$primaryGroup->Name]++;
            }
        }

        // call configurable hook
        if (is_callable(static::$onApplyUserChanges)) {
            call_user_func(static::$onApplyUserChanges, $Job, $User, $row);
        }
        
        $results['finished-analysing']++;
    }

    protected static function _getPersonLogOptions()
    {
        return array(
            'labelRenderers' => array(
                'AdvisorID' => 'Advisor'
            ),
            'valueRenderers' => array(
                'AdvisorID' => function($advisorId) {
                    return $advisorId ? User::getByID($advisorId)->getTitle() : null;
                }
            )
        );
    }

    protected static function _getOrCreateParticipant(Section $Section, User $User, $role, $pretend = true)
    {
        if ($pretend && !$Section->isPhantom) {
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

    protected static $_currentMasterTerm;
    protected static function _getCurrentMasterTerm(Job $Job)
    {
        if (!static::$_currentMasterTerm) {
            if (!($CurrentTerm = Term::getCurrent()) && !($CurrentTerm = Term::getNext())) {
                throw new \Exception('Could not find a current or next term');
            }

            static::$_currentMasterTerm = $CurrentTerm->getMaster();
        }

        return static::$_currentMasterTerm;
    }
    
    protected static function _readRow(array $row, array $columnsMap, array $requiredFields = [])
    {
        $output = array();

        foreach ($columnsMap as $externalKey => $internalKey) {
            if(is_numeric($externalKey)) {
                $subOutput = static::_readRow($row, $internalKey);
                
                $requiredValues = array_intersect_key($subOutput, array_flip($requiredFields));
                $emptyFields = array_filter($requiredValues, function($value){
                    return empty($value);
                });
                
               
                if (empty($requiredFields) || empty($emptyFields)) {

                    $output[] = $subOutput;
                }
                
                continue;
            }
            
            if (array_key_exists($externalKey, $row)) {
          
                $output[$internalKey] = $row[$externalKey];
                $output['_rest'] = $row;
            }
                
            unset($row[$externalKey]);
        }

        return $output;
    }

    protected static function _logRow(Job $Job, $noun, $rowNumber, array $row)
    {
        $logs = array();
        
        if(!array_key_exists('_rest', $row)) {
            foreach($row as $index => $subRow) {
                $logs[$index] = static::_logRow($Job, $noun, $rowNumber, $subRow);
            }
        } else {
            $nonEmptyColumns = array_filter($row);
            unset($nonEmptyColumns['_rest']);
    
            $summaryColumns = array_slice($nonEmptyColumns, 0, static::$logRowColumnCount, true);
    
            return $Job->log(sprintf(
                'Analyzing %s row #%03u: %s',
                $noun,
                $rowNumber,
                http_build_query($summaryColumns) . (count($nonEmptyColumns) > count($summaryColumns) ? '&...' : '')
            ), LogLevel::DEBUG);
        }
        
        return $logs;
    }
    
    protected static function _saveRow(Job $Job, $row, $lookupColumns, array &$results, $pretend=true)
    {
        if (!$Record = static::_getPerson($Job, $row, $lookupColumns)) {
            if (!static::$addNewParentRecords){
                $results['parentCreationSkipped']++;
                return;
            } else {
                $Record = Person::create();
            }
        }
        // apply values from spreadsheet
        try {
            static::_applyUserChanges($Job, $Record, $row, $results);
            
        } catch (RemoteRecordInvalid $e) {
            if ($e->getValueKey()) {
                $results['failed'][$e->getMessageKey()][$e->getValueKey()]++;
            } else {
                $results['failed'][$e->getMessageKey()]++;
            }
            $Job->log($e->getMessage(), LogLevel::ERROR);
            return;
        }

        // validate record
        if (!static::_validateRecord($Job, $Record, $results)) {
            return;
        }
        
        static::_saveRecord($Job, $Record, $pretend, $results, static::_getPersonLogOptions(), $row);
    }
    
    protected static function _saveRecord(Job $Job, \ActiveRecord $Record, $pretend, array &$results, $logOptions = array(), $row = [])
    {
        // call configurable hook
        if (method_exists(__CLASS__, static::$onBeforeSaveRecord)) {
            call_user_func([__CLASS__, static::$onBeforeSaveRecord], $Job, $Record, $results, $pretend, $logOptions, $row);
        }


        // generate log entry
        $logEntry = $Job->logRecordDelta($Record, $logOptions);

        if ($logEntry['action'] == 'create') {
            $results['created']++;
        } elseif ($logEntry['action'] == 'update') {
            $results['updated']++;
        }


        // save changes
        if (!$pretend) {
            $Record->save();
        }
    
        // call configurable hook

        if (method_exists(__CLASS__, static::$onSaveRecord)) {
            call_user_func([__CLASS__, static::$onSaveRecord], $Job, $Record, $results, $pretend, $logOptions, $row);
        }
    }
    
    public static function onRecordSave(Job $Job, Person $User, array $results, $pretend = true,  $logOptions = array(), $row = array()) {
        
        $Student = Student::getByStudentNumber($row['StudentNumber']);

        $Relationship = Relationship::create([
            'Label' => $row['Relationship'] ? ucfirst(strtolower($row['Relationship']))  : ($User->isA(Person::class) ? 'Guardian' : 'Other'),
            'PersonID' => $Student->ID,
            'RelatedPersonID' => $User->ID
        ]);
        
        if (Relationship::$templates[strtolower($Relationship->Label)]['Relationship']) {
            $Relationship->setFields(Relationship::$templates[strtolower($Relationship->Label)]['Relationship']);
        }

        if($Relationship->validate() && !$pretend) {
            $Relationship->save();
            
            $Job->logRecordDelta($Relationship, array(
                'messageRenderer' => function($logEntry) use ($User, $Student) {
                    return sprintf('Setting %s relationship for %s to %s',$logEntry['record']->Label, $Student->FullName, $User->FullName);
                }
            ));
            
            $inverseTemplate = Relationship::$templates[strtolower($Relationship->Label)]['Inverse'];
            
            if(is_array($inverseTemplate)) {
                $inverseLabel = $Student->Gender ? $inverseTemplate[$Student->Gender] : $inverseTemalte['Neutral'];
            } else {
                $inverseLabel = $inverseTemplate;
            }
            
            $InverseRelationship = Relationship::create([
                'Label' => $inverseLabel,
                'PersonID' => $User->ID,
                'RelatedPersonID' => $Student->ID
            ]);
            
            
            
            if($InverseRelationship->validate()) {
                $InverseRelationship->save();
                
                $Job->logRecordDelta($InverseRelationship, array(
                    'messageRenderer' => function($logEntry) use ($Student, $Student) {
                        return sprintf('Setting %s inverse relationship for %s to ',$logEntry['record']->Label, $User->FullName, $Student->FullName);
                    }
                ));
            }

        }
    }
}