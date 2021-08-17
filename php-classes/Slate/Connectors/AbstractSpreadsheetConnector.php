<?php

namespace Slate\Connectors;

use DB;
use Slate;
use SpreadsheetReader;
use Emergence\Connectors\IJob;
use Emergence\Connectors\Mapping;
use Emergence\Connectors\Exceptions\RemoteRecordInvalid;
use Emergence\Util\Capitalizer;

use Exception;
use Psr\Log\LogLevel;

use Slate\People\Student;
use Emergence\People\User;
use Emergence\People\IPerson;
use Emergence\People\Groups\Group;
use Emergence\People\Groups\GroupMember;
use Emergence\People\ContactPoint\Email;
use Emergence\People\ContactPoint\Phone;
use Emergence\People\ContactPoint\Postal;

use Slate\Term;
use Slate\Courses\Course;
use Slate\Courses\Section;
use Slate\Courses\SectionParticipant;
use Slate\Courses\Department;
use Slate\Courses\Schedule;
use Emergence\Locations\Location;


class AbstractSpreadsheetConnector extends \Emergence\Connectors\AbstractSpreadsheetConnector
{
    // ExternalKey values for mappings read into ForeignKey columns
    public static $personForeignKeyName = 'person[foreign_key]';
    public static $sectionForeignKeyName = 'section[foreign_key]';


    // group assignments
    public static $studentsRootGroup = 'students';
    public static $studentsGraduationYearGroups = true;
    public static $alumniRootGroup = 'alumni';
    public static $staffRootGroup = 'staff';
    public static $teachersRootGroup = 'teachers';
    public static $parentsRootGroup = 'parents';

    // section referencing
    public static $sectionCodeReferences = false;
    public static $sectionMappingReferences = true;

    // location assignments
    public static $sectionsRootLocation = null;

    // workflow callable overrides
    public static $sectionTitleFormatter;
    public static $onUserNotFound;
    public static $onApplyUserChanges;
    public static $onApplySectionChanges;
    public static $getSectionTerm;

    public static $filterPerson;
    public static $filterSection;
    public static $filterEnrollment;


    // column maps
    public static $studentColumns = [
        'Key' => 'ForeignKey',
        'School ID Number' => 'StudentNumber',
            'Student ID' => 'StudentNumber',
        'Username' => 'Username',
        'Password' => 'Password',
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
        'Grade' => 'Grade',
        'School' => 'School',
        'Cohort' => 'Group', 'Group' => 'Group',
        'Advisor' => 'AdvisorUsername',
#        'Assigned Password',
#        'Email',
#        'Phone',
#        'Postal Address'
    ];

    public static $alumniColumns = [
        'Username' => 'Username',
        'Password' => 'Password',
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
    ];

    public static $staffColumns = [
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
        'Password' => 'Password',
        'Account Level' => 'AccountLevel',
            'Account Type' => 'AccountLevel',
        'Role / Job Title' => 'About',
        'Email' => 'Email',
        'School' => 'School',
#        'Phone',
#        'Postal Address'
    ];

    public static $sectionColumns = [
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
    ];

    public static $enrollmentColumns = [
        'School ID Number' => 'StudentNumber',
            'School ID' => 'StudentNumber',
            'Student Number' => 'StudentNumber',
        'Username' => 'Username'
    ];


    // minimum required columns
    public static $studentRequiredColumns = [
        'StudentNumber',
        'FirstName',
        'LastName'
    ];

    public static $alumniRequiredColumns = [
        'FirstName',
        'LastName'
    ];

    public static $staffRequiredColumns = [
        'FirstName',
        'LastName'
    ];

    public static $sectionRequiredColumns = [
        'CourseCode'
    ];

    public static $enrollmentRequiredColumns = [];


    // workflow implementations
    protected static function _getJobConfig(array $requestData)
    {
        $config = parent::_getJobConfig($requestData);

        $config['autoCapitalize'] = !empty($requestData['autoCapitalize']);
        $config['updateUsernames'] = !empty($requestData['updateUsernames']);
        $config['updatePasswords'] = !empty($requestData['updatePasswords']);
        $config['updateAbout'] = !empty($requestData['updateAbout']);
        $config['matchFullNames'] = !empty($requestData['matchFullNames']);
        $config['autoAssignEmail'] = !empty($requestData['autoAssignEmail']);
        $config['clearGroups'] = !empty($requestData['clearGroups']);
        $config['masterTerm'] = !empty($requestData['masterTerm']) ? $requestData['masterTerm'] : null;
        $config['enrollmentDivider'] = !empty($requestData['enrollmentDivider']) ? $requestData['enrollmentDivider'] : null;

        return $config;
    }

    protected static function _createJob(array $config = [])
    {
        // create extended Slate Job
        return Job::create([
            'Connector' => get_called_class(),
            'Config' => $config
        ]);
    }


    // task handlers
    public static function pullStudents(IJob $Job, SpreadsheetReader $spreadsheet, $pretend = true)
    {
        // check input
        try {
            static::_requireColumns('students', $spreadsheet, static::getStackedConfig('studentRequiredColumns'), static::getStackedConfig('studentColumns'));
        } catch (Exception $e) {
            $Job->logException($e);
            return false;
        }

        // initialize results
        $results = [
            'analyzed' => 0
        ];


        // loop through rows
        while ($row = $spreadsheet->getNextRow()) {

            // process input row through column mapping
            $row = static::_readStudent($Job, $row);


            // start logging analysis
            $results['analyzed']++;
            static::_logRow($Job, 'student', $results['analyzed'], $row);


            // skip row if filter function flags it
            if ($filterReason = static::_filterPerson($Job, $row)) {
                $results['filtered'][$filterReason]++;
                $Job->notice('Skipping student row #{rowNumber} due to filter: {reason}', [
                    'rowNumber' => $results['analyzed'],
                    'reason' => $filterReason
                ]);
                continue;
            }

            $Record = null;
            $Mapping = null;

            if (!empty($row['ForeignKey'])) {
                if ($Mapping = static::_getPersonMapping($row['ForeignKey'])) {
                    $Record = $Mapping->Context;
                }
            }


            if (!$Record) {
                 $Record = static::_getPerson($Job, $row);
            }


            // get existing user or start creating a new one
            if (!$Record) {
                $Record = Student::create();
                $Record->setTemporaryPassword();
            }


            // apply values from spreadsheet
            try {
                static::_applyStudentUserChanges($Job, $Record, $row, $results);
            } catch (RemoteRecordInvalid $e) {
                if ($e->getValueKey()) {
                    $results['failed'][$e->getMessageKey()][$e->getValueKey()]++;
                } else {
                    $results['failed'][$e->getMessageKey()]++;
                }

                $Job->logException($e);
                continue;
            }


            // validate record
            if (!static::_validateRecord($Job, $Record, $results)) {
                continue;
            }


            // save record
            static::_saveRecord($Job, $Record, $pretend, $results, static::_getPersonLogOptions());

            if ($row['ForeignKey'] && !$Mapping) {
                $Mapping = Mapping::create([
                    'Context' => $Record,
                    'Source' => 'creation',
                    'Connector' => static::getConnectorId(),
                    'ExternalKey' => static::$personForeignKeyName,
                    'ExternalIdentifier' => $row['ForeignKey']
                ], !$pretend);

                $Job->notice('Mapping external identifier {externalIdentifier} to student {studentUsername}', [
                    'externalIdentifier' => $row['ForeignKey'],
                    'studentUsername' => $Record->Username
                ]);
            }
        }

        return $results;
    }

    public static function pullAlumni(IJob $Job, SpreadsheetReader $spreadsheet, $pretend = true)
    {
        // check input
        try {
            static::_requireColumns('alumni', $spreadsheet, static::getStackedConfig('alumniRequiredColumns'), static::getStackedConfig('alumniColumns'));
        } catch (Exception $e) {
            $Job->logException($e);
            return false;
        }

        // initialize results
        $results = [
            'analyzed' => 0
        ];


        // loop through rows
        while ($row = $spreadsheet->getNextRow()) {

            // process input row through column mapping
            $row = static::_readAlumni($Job, $row);


            // start logging analysis
            $results['analyzed']++;
            static::_logRow($Job, 'alumni', $results['analyzed'], $row);


            // skip row if filter function flags it
            if ($filterReason = static::_filterPerson($Job, $row)) {
                $results['filtered'][$filterReason]++;
                $Job->notice('Skipping alumni row #{rowNumber} due to filter: {reason}', [
                    'rowNumber' => $results['analyzed'],
                    'reason' => $filterReason
                ]);
                continue;
            }


            // get existing user or start creating a new one
            if (!$Record = static::_getPerson($Job, $row)) {
                $Record = Student::create();
                $Record->setTemporaryPassword();
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

                $Job->logException($e);
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

    public static function pullStaff(IJob $Job, SpreadsheetReader $spreadsheet, $pretend = true)
    {
        // check input
        try {
            static::_requireColumns('staff', $spreadsheet, static::getStackedConfig('staffRequiredColumns'), static::getStackedConfig('staffColumns'));
        } catch (Exception $e) {
            $Job->logException($e);
            return false;
        }

        // initialize results
        $results = [
            'analyzed' => 0
        ];


        // loop through rows
        while ($row = $spreadsheet->getNextRow()) {

            // process input row through column mapping
            $row = static::_readStaff($Job, $row);


            // start logging analysis
            $results['analyzed']++;
            static::_logRow($Job, 'staff', $results['analyzed'], $row);


            // skip row if filter function flags it
            if ($filterReason = static::_filterPerson($Job, $row)) {
                $results['filtered'][$filterReason]++;
                $Job->notice('Skipping staff row #{rowNumber} due to filter: {reason}', [
                    'rowNumber' => $results['analyzed'],
                    'reason' => $filterReason
                ]);
                continue;
            }


            // get existing user or start creating a new one
            if (!$Record = static::_getPerson($Job, $row)) {
                $Record = User::create([
                    'AccountLevel' => 'Staff'
                ]);
                $Record->setTemporaryPassword();
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

                $Job->logException($e);
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

    public static function pullSections(IJob $Job, SpreadsheetReader $spreadsheet, $pretend = true)
    {
        // check input
        try {
            static::_requireColumns('Sections', $spreadsheet, static::getStackedConfig('sectionRequiredColumns'), static::getStackedConfig('sectionColumns'));
        } catch (Exception $e) {
            $Job->logException($e);
            return false;
        }

        $MasterTerm = $Job->getMasterTerm();


        // initialize results
        $results = [
            'analyzed' => 0
        ];


        // loop through rows
        while ($row = $spreadsheet->getNextRow()) {

            // process input row through column mapping
            $row = static::_readSection($Job, $row);


            // start logging analysis
            $results['analyzed']++;
            static::_logRow($Job, 'sections', $results['analyzed'], $row);


            // skip row if filter function flags it
            if ($filterReason = static::_filterSection($Job, $row)) {
                $results['filtered'][$filterReason]++;
                $Job->notice('Skipping section row #{rowNumber} due to filter: {reason}', [
                    'rowNumber' => $results['analyzed'],
                    'reason' => $filterReason
                ]);
                continue;
            }


            // try to get existing section by mapping
            $Record = null;
            $Mapping = null;
            $externalIdentifier = null;

            if (!empty($row['SectionExternal'])) {
                $externalIdentifier = sprintf('%s:%s', $MasterTerm->Handle, $row['SectionExternal']);
                if ($Mapping = static::_getSectionMapping($externalIdentifier)) {
                    $Record = $Mapping->Context;
                }
            }


            try {
                // try to get existing record
                if (!$Record) {
                    $Record = static::getSection($Job, $MasterTerm, $row);
                }

                // create a new record if necessary
                if (!$Record) {
                    $Record = Section::create();

                    if (!empty($row['SectionCode'])) {
                        $Record->Code = $row['SectionCode'];
                    }
                }

                // get teacher, but add later
                $teachers = static::getSectionTeachers($Job, $Record, $row);

                // apply values from spreadsheet
                static::_applySectionChanges($Job, $MasterTerm, $Record, $row, $results);
            } catch (RemoteRecordInvalid $e) {
                if (!isset($results['failed'][$e->getMessageKey()])) {
                    $results['failed'][$e->getMessageKey()] = [
                        'no-value' => 0
                    ];
                }
                if ($e->getValueKey()) {
                    if (!isset($results['failed'][$e->getMessageKey()][$e->getValueKey()])) {
                        $results['failed'][$e->getMessageKey()][$e->getValueKey()] = 0;
                    }

                    $results['failed'][$e->getMessageKey()][$e->getValueKey()]++;
                } else {
                    $results['failed'][$e->getMessageKey()]['no-value']++;
                }

                $Job->logException($e);
                continue;
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


            // log related changes
            if ($Record->Course) {
                $Job->logRecordDelta($Record->Course);
            }

            if ($Record->Course->Department) {
                $Job->logRecordDelta($Record->Course->Department);
            }

            if ($Record->Term) {
                $Job->logRecordDelta($Record->Term);
            }

            if ($Record->Schedule) {
                $Job->logRecordDelta($Record->Schedule);
            }

            if ($Record->Location) {
                $Job->logRecordDelta($Record->Location);
            }


            // save changes
            if (!$pretend) {
                $Record->save();
            }


            // save mapping
            if (!$Mapping && $externalIdentifier) {
                $Mapping = Mapping::create([
                    'Context' => $Record
                    ,'Source' => 'creation'
                    ,'Connector' => static::getConnectorId()
                    ,'ExternalKey' => static::$sectionForeignKeyName
                    ,'ExternalIdentifier' => $externalIdentifier
                ], !$pretend);

                $Job->notice('Mapping external identifier {externalIdentifier} to section {sectionTitle}', [
                    'externalIdentifier' => $externalIdentifier,
                    'sectionTitle' => $Record->getTitle()
                ]);
            }


            // add teacher
            foreach ($teachers AS $Teacher) {
                $Participant = static::_getOrCreateParticipant($Record, $Teacher, ['Role' => 'Teacher'], $pretend);
                $logEntry = static::_logParticipant($Job, $Participant);

                if (!$pretend) {
                    $Participant->save();
                }

                if ($logEntry['action'] == 'create') {
                    $results['teacher-enrollments-created']++;
                } elseif ($logEntry['action'] == 'update') {
                    $results['teacher-enrollments-updated']++;
                }
            }
        }


        return $results;
    }

    public static function pullEnrollments(IJob $Job, SpreadsheetReader $spreadsheet, $pretend = true)
    {
        // check input
        try {
            static::_requireColumns('Enrollments', $spreadsheet, static::getStackedConfig('enrollmentRequiredColumns'), static::getStackedConfig('enrollmentColumns'));
        } catch (Exception $e) {
            $Job->logException($e);
            return false;
        }

        if (empty($Job->Config['masterTerm'])) {
            $Job->logException(new Exception('masterTerm required to import enrollments'));
            return false;
        }

        if (!$MasterTerm = Term::getByHandle($Job->Config['masterTerm'])) {
            $Job->logException(new Exception('masterTerm not found'));
            return false;
        }


        // initialize results
        $studentsBySection = [];
        $sectionsByIdentifier = [];
        $results = [
            'rows-analyzed' => 0,
            'enrollments-analyzed' => 0
        ];


        // loop through rows for incoming roster
        while ($row = $spreadsheet->getNextRow()) {
            $Record = null;


            // process input row through column mapping
            $row = static::_readEnrollment($Job, $row);


            // start logging analysis
            $results['rows-analyzed']++;
            static::_logRow($Job, 'enrollments', $results['rows-analyzed'], $row);


            // skip row if filter function flags it
            if ($filterReason = static::_filterEnrollment($Job, $row)) {
                $results['filtered'][$filterReason]++;
                $Job->notice('Skipping enrollment row #{rowNumber} due to filter: {reason}', [
                    'rowNumber' => $results['rows-analyzed'],
                    'reason' => $filterReason
                ]);
                continue;
            }


            // get student
            if (!empty($row['StudentNumber'])) {
                if (!$Student = Student::getByStudentNumber($row['StudentNumber'])) {
                    $results['failed']['student-number-not-found'][$row['StudentNumber']]++;
                    $Job->error('Failed to lookup student by number for {studentNumber}', ['studentNumber' => $row['StudentNumber']]);
                    continue;
                }
            } elseif (!empty($row['Username'])) {
                if (!$Student = Student::getByUsername($row['Username'])) {
                    $results['failed']['student-username-not-found'][$row['Username']]++;
                    $Job->error('Failed to lookup student by username for {username}', ['username' => $row['Username']]);
                    continue;
                }
            } else {
                $results['failed']['missing-student-identifier']++;
                $Job->error('Missing enrollment student identifier for row #{rowNumber}', ['rowNumber' => $results['rows-analyzed']]);
                continue;
            }


            // loop through every other column
            foreach ($row['_rest'] as $sectionIdentifier) {
                if (!$sectionIdentifier) {
                    continue;
                }

                $Participant = null;
                $results['enrollments-analyzed']++;


                // build participant data
                $participantData = [
                    'Role' => 'Student'
                ];

                if (isset($row['StartDate'])) {
                    if (!$row['StartDate']) {
                        $participantData['StartDate'] = null;
                    } elseif (!$participantData['StartDate'] = strtotime($row['StartDate'])) {
                        $results['failed']['invalid-start-date']++;
                        $Job->error('Invalid start date "{date}" for row #{rowNumber}', [
                            'rowNumber' => $results['rows-analyzed'],
                            'date' => $row['StartDate']
                        ]);
                        continue;
                    }
                }

                if (isset($row['EndDate'])) {
                   if (!$row['EndDate']) {
                        $participantData['EndDate'] = null;
                    } elseif (!$participantData['EndDate'] = strtotime($row['EndDate'])) {
                        $results['failed']['invalid-end-date']++;
                        $Job->error('Invalid end date "{date}" for row #{rowNumber}', [
                            'rowNumber' => $results['rows-analyzed'],
                            'date' => $row['EndDate']
                        ]);
                        continue;
                    }
                }


                // Optionally split code based user value
                if (!$Job->Config['enrollmentDivider']) {
                    $sectionIdentifiers = [$sectionIdentifier];
                } else {
                    $sectionIdentifiers = explode($Job->Config['enrollmentDivider'], $sectionIdentifier);
                }

                foreach ($sectionIdentifiers as $sectionIdentifier) {

                    // get cached section or look up mapping
                    if (!$Section = $sectionsByIdentifier[$sectionIdentifier]) {
                        if (static::$sectionCodeReferences) {
                            $Section = Section::getByCode($sectionIdentifier);
                        }


                        if (!$Section && static::$sectionMappingReferences) {
                            $externalIdentifier = sprintf('%s:%s', $MasterTerm->Handle, $sectionIdentifier);
                            $Mapping = Mapping::getByWhere([
                                'ContextClass' => Section::getStaticRootClass(),
                                'Connector' => static::getConnectorId(),
                                'ExternalKey' => static::$sectionForeignKeyName,
                                'ExternalIdentifier' => $externalIdentifier
                            ]);
                        }

                        if ($Mapping) {
                            $Section = $sectionsByIdentifier[$sectionIdentifier] = $Mapping->Context;

                            if (!$Section) {
                                $Job->error('Section #{sectionId} not found for mapping #{mappingId} from {externalIdentifier}', [
                                    'sectionId' => $Mapping->ContextID,
                                    'mappingID' => $Mapping->ID,
                                    'externalIdentifier' => $Mapping->ExternalIdentifier
                                ]);
                                $results['failed']['orphan-mapping'][$sectionIdentifier]++;
                                continue;
                            }
                        } elseif (!$Section) {
                            $results['enrollments-failed']['section-not-found'][$sectionIdentifier]++;
                            continue;
                        }
                    }


                    // save and log participant
                    $Participant = static::_getOrCreateParticipant($Section, $Student, $participantData, $pretend);
                    $logEntry = static::_logParticipant($Job, $Participant);

                    if (!$pretend) {
                        $Participant->save();
                    }

                    if ($logEntry['action'] == 'create') {
                        $results['enrollments-created']++;
                    } elseif ($logEntry['action'] == 'update') {
                        $results['enrollments-updated']++;
                    }

                    // record enrollment in cache for pruning phase
                    $studentsBySection[$Section->ID][] = $Student->ID;
                }
            }
        }


        // scan current roster for students to remove
        foreach ($studentsBySection AS $sectionId => $studentIds) {
            $enrolledStudentIds = DB::allValues(
                'PersonID',
                'SELECT PersonID FROM `%s` WHERE CourseSectionID = %u AND Role = "Student"',
                [
                    SectionParticipant::$tableName,
                    $sectionId
                ]
            );

            $removeStudentIds = array_diff($enrolledStudentIds, $studentIds);

            if (count($removeStudentIds)) {
                if (!$pretend) {
                    DB::nonQuery(
                        'DELETE FROM `%s` WHERE CourseSectionID = %u AND Role = "Student" AND PersonID IN (%s)',
                        [
                            SectionParticipant::$tableName,
                            $sectionId,
                            implode(',', $removeStudentIds)
                        ]
                    );
                }

                $results['enrollments-removed'] += count($removeStudentIds);

                foreach ($removeStudentIds AS $studentId) {
                    $Job->info('Removed user {user} from section {section} with role Student', [
                        'user' => User::getByID($studentId)->getTitle(),
                        'section' => Section::getByID($sectionId)->getTitle()
                    ]);
                }
            }
        }


        return $results;
    }


    // protected methods
    protected static function initStudentRequiredColumns(array $config)
    {
        return static::initRequiredColumns($config);
    }

    protected static function initAlumniRequiredColumns(array $config)
    {
        return static::initRequiredColumns($config);
    }

    protected static function initStaffRequiredColumns(array $config)
    {
        return static::initRequiredColumns($config);
    }

    protected static function initSectionRequiredColumns(array $config)
    {
        return static::initRequiredColumns($config);
    }

    protected static function initEnrollmentRequiredColumns(array $config)
    {
        return static::initRequiredColumns($config);
    }

    protected static function _readStudent(IJob $Job, array $row)
    {
        $row = static::_readRow($row, static::getStackedConfig('studentColumns'));

        static::_fireEvent('readStudent', [
            'Job' => $Job,
            'row' => &$row
        ]);

        return $row;
    }

    protected static function _readAlumni(IJob $Job, array $row)
    {
        $row = static::_readRow($row, static::getStackedConfig('alumniColumns'));

        static::_fireEvent('readAlumni', [
            'Job' => $Job,
            'row' => &$row
        ]);

        return $row;
    }

    protected static function _readStaff(IJob $Job, array $row)
    {
        $row = static::_readRow($row, static::getStackedConfig('staffColumns'));

        static::_fireEvent('readStaff', [
            'Job' => $Job,
            'row' => &$row
        ]);

        return $row;
    }

    protected static function _readSection(IJob $Job, array $row)
    {
        $row = static::_readRow($row, static::getStackedConfig('sectionColumns'));

        static::_fireEvent('readSection', [
            'Job' => $Job,
            'row' => &$row
        ]);

        return $row;
    }

    protected static function _readEnrollment(IJob $Job, array $row)
    {
        $row = static::_readRow($row, static::getStackedConfig('enrollmentColumns'));

        static::_fireEvent('readEnrollment', [
            'Job' => $Job,
            'row' => &$row
        ]);

        return $row;
    }

    protected static function _filterPerson(IJob $Job, array $row)
    {
        $filterResult = false;

        if (is_callable(static::$filterPerson)) {
            $filterResult = call_user_func(static::$filterPerson, $Job, $row);

            if ($filterResult === true) {
                $filterResult = 'no-reason';
            }
        }

        return $filterResult;
    }

    protected static function _filterSection(IJob $Job, array $row)
    {
        $filterResult = false;

        if (is_callable(static::$filterSection)) {
            $filterResult = call_user_func(static::$filterSection, $Job, $row);

            if ($filterResult === true) {
                $filterResult = 'no-reason';
            }
        }

        return $filterResult;
    }

    protected static function _filterEnrollment(IJob $Job, array $row)
    {
        $filterResult = false;

        if (is_callable(static::$filterEnrollment)) {
            $filterResult = call_user_func(static::$filterEnrollment, $Job, $row);

            if ($filterResult === true) {
                $filterResult = 'no-reason';
            }
        }

        return $filterResult;
    }

    protected static function _getPersonMapping($foreignKey)
    {
        return Mapping::getByWhere([
                'ContextClass' => User::getStaticRootClass(),
                'Connector' => static::getConnectorId(),
                'ExternalKey' => static::$personForeignKeyName,
                'ExternalIdentifier' => $foreignKey
            ]);
    }


    protected static function _getPersonByExternalIdentifier($foreignKey)
    {
        $Mapping = static::_getPersonMapping($foreignKey);

            if ($Mapping) {
                return $Mapping->Context;
            }

        return null;
    }

    protected static function _getPerson(IJob $Job, array $row)
    {
        // try to get existing account by foreign key column
        if (!empty($row['ForeignKey']) && ($User = static::_getPersonByExternalIdentifier($row['ForeignKey']))) {
            return $User;
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
            list($emailLocal, $emailDomain) = explode('@', $row['Email'], 2);
            if (strcasecmp($emailDomain, Slate::$userEmailDomain) == 0 && ($User = User::getByUsername($emailLocal))) {
                return $User;
            }
        }


        // try to get existing user by full name
        if ($Job->Config['matchFullNames'] && !empty($row['FirstName']) && !empty($row['LastName']) && ($User = User::getByFullName($row['FirstName'], $row['LastName']))) {
            return $User;
        }


        // call configurable hook
        if (is_callable(static::$onUserNotFound)) {
            return call_user_func(static::$onUserNotFound, $Job, $row);
        }


        return null;
    }

    protected static function _applyUserChanges(IJob $Job, User $User, array $row, array &$results)
    {
        $currentGraduationYear = $Job->getGraduationYear();

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

        if (!empty($row['PreferredName'])) {
            $User->PreferredName = $_formatPronoun($row['PreferredName']);
        }


        // apply account
        if (!empty($row['AccountLevel']) && in_array($row['AccountLevel'], User::getFieldOptions('AccountLevel', 'values'))) {
            $User->AccountLevel = $row['AccountLevel'];
            if ($User->isPhantom) {
                $Job->debug('Initializing AccountLevel to {accountLevel}', ['accountLevel' => $row['AccountLevel']]);
            }
        }

        if (
            !empty($row['Password']) &&
            (
                $User->isPhantom ||
                (
                    !empty($Job->Config['updatePasswords']) &&
                    !$User->verifyPassword($row['Password'])
                )
            )
        ) {
            $User->setClearPassword($row['Password']);
            $results['password-updated']++;
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

        if (!empty($row['About']) && (!$User->About || !empty($Job->Config['updateAbout']))) {
            $User->About = $row['About'];
        }


        // apply school data
        if (!empty($row['StudentNumber'])) {
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
            $Mapping = Mapping::getByWhere([
                'ContextClass' => User::getStaticRootClass(),
                'Connector' => static::getConnectorId(),
                'ExternalKey' => static::$personForeignKeyName,
                'ExternalIdentifier' => $row['AdvisorForeignKey']
            ]);

            if (!$Mapping) {
                throw new RemoteRecordInvalid(
                    'advisor-not-found-by-foreign-key',
                    sprintf('Advisor not found for foreign key "%s"', $row['AdvisorForeignKey']),
                    $row,
                    $row['AdvisorForeignKey']
                );
            }

            $User->Advisor = $Mapping->Context;
        } elseif (($advisorNameSplit = !empty($row['AdvisorFirstName']) && !empty($row['AdvisorLastName'])) || !empty($row['AdvisorFullName'])) {
            if ($advisorNameSplit) {
                $Advisor = User::getByFullName($row['AdvisorFirstName'], $row['AdvisorLastName']);
            } else {
                $advisorName = User::parseFullName($row['AdvisorFullName']);
                $Advisor = User::getByFullName($advisorName['FirstName'], $advisorName['LastName']);
            }

            if (!$Advisor) {
                $fullName = $advisorNameSplit ? $row['AdvisorFirstName'] . ' ' . $row['AdvisorLastName'] : $row['AdvisorFullName'];

                throw new RemoteRecordInvalid(
                    'advisor-not-found-by-name',
                    sprintf('Teacher not found for full name "%s"', $fullName),
                    $row,
                    $fullName
                );
            }

            $User->Advisor = $Advisor;
        }


        // apply or generate username
        if (!$User->Username || !empty($Job->Config['updateUsernames'])) {
            if (!empty($row['Username'])) {
                $User->Username = $row['Username'];
            } else {
                $User->Username = $User->getUniqueUsername();

                if ($User->isPhantom) {
                    $Job->debug('Assigned username {username}', ['username' => $User->Username]);
                }
            }
        }


        // apply email address
        if (!empty($row['Email'])) {
            if (!$User->PrimaryEmail = Email::getByString($row['Email'])) {
                $User->PrimaryEmail = Email::fromString($row['Email']);
                $User->PrimaryEmail->Label = 'Imported Email';
            }

            $User->ContactPoints = array_merge($User->ContactPoints, [$User->PrimaryEmail]);
        } elseif (Slate::$userEmailDomain && $Job->Config['autoAssignEmail']) {
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

                $User->ContactPoints = array_merge($User->ContactPoints, [$User->PrimaryEmail]);
                $Job->debug('Assigned auto-generated email address {email}', ['email' => $User->PrimaryEmail]);
            }
        }

        if ($User->PrimaryEmail) {
            $logEntry = $Job->logRecordDelta($User->PrimaryEmail, [
                'messageRenderer' => function($logEntry) use ($User) {
                    return sprintf(
                        '%s user %s primary email to %s',
                        $logEntry['action'] == 'create' ? 'Setting' : 'Changing',
                        $User->getTitle(),
                        $logEntry['record']->toString()
                    );
                }
            ]);

            if ($logEntry) {
                if ($logEntry['action'] == 'create') {
                    $results['assigned-primary-email']++;
                } else {
                    $results['updated-primary-email']++;
                }
            }
        }


        // set address with zip seperated
        /*
        if (!empty($row['Address'] && !empty($row['Zip']))) {
            $postalString = $row['Address'] . ', ' . $row['Zip'];

            if (!$User->PrimaryPostal = Postal::getByString($postalString)) {
                $primaryPostal = Postal::create();
                $primaryPostal->loadString($postalString);
                $User->PrimaryPostal = $primaryPostal;
                $Job->logRecordDelta($User->PrimaryPostal, array(
                    'messageRenderer' => function($logEntry) use ($User) {
                        return sprintf('Setting user %s primary postal to %s', $User->getTitle(), $logEntry['record']->toString());
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


        // determine primary group
        $Group = null;

        if (
            $User->isA(Student::class)
            && (
                $rootGroupHandle = (
                    $User->GraduationYear >= $currentGraduationYear
                    ? static::$studentsRootGroup
                    : static::$alumniRootGroup
                )
            )
        ) {
            // resolve schoo-specific group
            if (is_array($rootGroupHandle)) {
                if (empty($row['School'])) {
                    throw new RemoteRecordInvalid(
                        'student-school-not-set',
                        'Student does not have school set',
                        $row
                    );
                } elseif (empty($rootGroupHandle[$row['School']])) {
                    throw new RemoteRecordInvalid(
                        'student-school-not-found',
                        sprintf('Student school "%s" does not exist', $row['School']),
                        $row,
                        $row['School']
                    );
                }

                $rootGroupHandle = $rootGroupHandle[$row['School']];
            }

            // get root group initially for either student or alumni
            if (!$Group = Group::getByHandle($rootGroupHandle)) {
                throw new RemoteRecordInvalid(
                    'student-root-group-not-found',
                    sprintf('Student root group "%s" does not exist', $rootGroupHandle),
                    $row,
                    $rootGroupHandle
                );
            }


            // move down to graduation year group if enabled
            if (static::$studentsGraduationYearGroups && $User->GraduationYear) {
                $ParentGroup = $Group;

                // try to get existing "Class of YYYY" group
                if (!$Group = Group::getByHandle("class_of_$User->GraduationYear")) {
                    $Group = Group::create([
                        'Name' => 'Class of '.$User->GraduationYear,
                        'Parent' => $ParentGroup
                    ]);

                    $Job->notice('Create graduation group {groupName} under {parentGroupName}', [
                        'groupName' => $Group->Name,
                        'parentGroupName' => $ParentGroup->Name
                    ]);
                }
            }


            // move down to custom subgroup if provided
            if ($Group && !empty($row['Group'])) {
                $ParentGroup = $Group;

                $Group = Group::getByWhere([
                    'ParentID' => $ParentGroup->ID,
                    'Name' => $row['Group']
                ]);

                if (!$Group) {
                    $Group = Group::create([
                        'Name' => $row['Group'],
                        'Parent' => $ParentGroup
                    ]);

                    $Job->notice('Create group {groupName} under group {parentGroupName}', [
                        'groupName' => $Group->Name,
                        'parentGroupName' => $ParentGroup->Name
                    ]);
                }
            }

        } elseif ($User->hasAccountLevel('Staff') && static::$staffRootGroup) {
            $groupHandle = $User->AccountLevel == 'Teacher' ? static::$teachersRootGroup : static::$staffRootGroup;

            // resolve schoo-specific group
            if (is_array($groupHandle)) {
                if (empty($row['School'])) {
                    throw new RemoteRecordInvalid(
                        'staff-school-not-set',
                        'Student does not have school set',
                        $row
                    );
                } elseif (empty($groupHandle[$row['School']])) {
                    throw new RemoteRecordInvalid(
                        'staff-school-not-found',
                        sprintf('Student school "%s" does not exist', $row['School']),
                        $row,
                        $row['School']
                    );
                }

                $groupHandle = $groupHandle[$row['School']];
            }

            if ($groupHandle && !($Group = Group::getByHandle($groupHandle))) {
                throw new RemoteRecordInvalid(
                    'staff-root-group-not-found',
                    sprintf('Staff root group "%s" does not exist', $groupHandle),
                    $row,
                    $groupHandle
                );
            }
        }


        if ($Group) {
            // check if user is already in the determined primary group or a subgroup of it
            $foundGroup = null;
            foreach ($User->Groups AS $currentGroup) {
                if ($currentGroup->Left >= $Group->Left && $currentGroup->Right <= $Group->Right) {
                    $foundGroup = $currentGroup;
                    break;
                }
            }

            // assign to determined group if needed
            if (!$foundGroup) {
                $Job->notice('Add {user} to group {group}', [
                    'user' => $User->getTitle(),
                    'group' => $Group->isPhantom ? $Group->Name : $Group->getFullPath()
                ]);
                $membership = GroupMember::create([
                    'Group' => $Group
                ]);
                $User->GroupMemberships = array_merge($User->GroupMemberships, [$membership]);
                $results['added-to-group'][$Group->Name]++;
            }
        }

        if ($Job->Config['clearGroups']) {
            $memberships = [];

            foreach ($User->GroupMemberships as $Membership) {
                if ($Group && ($Group === $Membership->Group || $Group->ID == $Membership->Group->ID)) {
                    $memberships[] = $Membership;
                } else {
                    $Job->notice('Remove {user} from group {group}', [
                        'user' => $User->getTitle(),
                        'group' => $Membership->Group->isPhantom ? $Membership->Group->Name : $Membership->Group->getFullPath()
                    ]);
                    $results['removed-from-group'][$Membership->Group->Name]++;
                }
            }

            $User->GroupMemberships = $memberships;
        }

        // call configurable hook
        if (is_callable(static::$onApplyUserChanges)) {
            call_user_func(static::$onApplyUserChanges, $Job, $User, $row);
        }
    }

    protected static function _applyStudentUserChanges(IJob $Job, User $User, array $row, array &$results)
    {
        static::_applyUserChanges($Job, $User, $row, $results);

        if ($User->AccountLevel == 'Disabled') {
            $User->AccountLevel = 'User';
        }
    }

    protected static function _getPersonLogOptions()
    {
        return [
            'labelRenderers' => [
                'AdvisorID' => 'Advisor'
            ],
            'valueRenderers' => [
                'AdvisorID' => function($advisorId) {
                    return $advisorId ? User::getByID($advisorId)->getTitle() : null;
                }
            ]
        ];
    }

    protected static function _getSectionMapping($foreignKey)
    {
        return Mapping::getByWhere([
            'ContextClass' => Section::getStaticRootClass(),
            'Connector' => static::getConnectorId(),
            'ExternalKey' => static::$sectionForeignKeyName,
            'ExternalIdentifier' => $foreignKey
        ]);
    }

    protected static function _getSectionByExternalIdentifier($externalIdentifier)
    {
        $Mapping = static::_getSectionMapping($externalIdentifier);

        if ($Mapping) {
            return $Mapping->Context;
        }

        return null;
    }

    protected static function getSection(IJob $Job, Term $MasterTerm, array $row)
    {
        // try to get existing section by code
        if (!empty($row['SectionCode'])) {
            return Section::getByCode($row['SectionCode']);
        }

        return null;
    }

    protected static function getSectionTeachers(IJob $Job, Section $Section, array $row)
    {
        $Teacher = null;

        if (!empty($row['TeacherUsername'])) {
            if (!$Teacher = User::getByUsername($row['TeacherUsername'])) {
                throw new RemoteRecordInvalid(
                    'teacher-not-found-by-username',
                    'Teacher not found for username: '.$row['TeacherUsername'],
                    $row,
                    $row['TeacherUsername']
                );
            }
        } elseif (($teacherNameSplit = !empty($row['TeacherFirstName']) && !empty($row['TeacherLastName'])) || !empty($row['TeacherFullName'])) {
            if ($teacherNameSplit) {
                $Teacher = User::getByFullName($row['TeacherFirstName'], $row['TeacherLastName']);
            } else {
                $teacherName = User::parseFullName($row['TeacherFullName']);
                $Teacher = User::getByFullName($teacherName['FirstName'], $teacherName['LastName']);
            }

            if (!$Teacher) {
                $fullName = $teacherNameSplit ? $row['TeacherFirstName'] . ' ' . $row['TeacherLastName'] : $row['TeacherFullName'];
                throw new RemoteRecordInvalid(
                    'teacher-not-found-by-name',
                    'Teacher not found for full name: '.$fullName,
                    $row,
                    $fullName
                );
            }
        }

        return $Teacher ? [$Teacher] : [];
    }

    protected static function getSectionTerm(IJob $Job, Term $MasterTerm, Section $Section, array $row)
    {
        if (is_callable(static::$getSectionTerm)) {
            return call_user_func(static::$getSectionTerm, $Job, $MasterTerm, $Section, $row);
        } else if (empty($row['Term'])) {
            return null;
        }

        if (!$Term = Term::getByHandle($row['Term'])) {
            throw new RemoteRecordInvalid(
                'term-not-found',
                sprintf('Term not found for handle "%s"', $row['Term']),
                $row,
                $row['Term']
            );
        }

        return $Term;
    }

    protected static function getSectionCourse(IJob $Job, Section $Section, array $row)
    {
        if (empty($row['CourseCode'])) {
            return null;
        }

        if (!$Course = Course::getByCode($row['CourseCode'])) {
            $Course = Course::create([
                'Code' => $row['CourseCode'],
                'Title' => $row['CourseTitle'] ?: $row['CourseCode'],
                'Department' => !empty($row['DepartmentTitle']) ? Department::getOrCreateByTitle($row['DepartmentTitle']) : null
            ]);
        }

        return $Course;
    }

    protected static function _applySectionChanges(IJob $Job, Term $MasterTerm, Section $Section, array $row)
    {
        if ($Course = static::getSectionCourse($Job, $Section, $row)) {
            $Section->Course = $Course;
        }

        if ($Term = static::getSectionTerm($Job, $MasterTerm, $Section, $row)) {
            $Section->Term = $Term;
        }

        if (!empty($row['Schedule'])) {
            $Section->Schedule = Schedule::getOrCreateByTitle($row['Schedule']);
        }

        if (!empty($row['Location'])) {
            $Section->Location = Location::getOrCreateByHandle('room-'.$row['Location'], false, [
                'Title' => 'Room '.$row['Location'],
                'Parent' => static::$sectionsRootLocation ? Location::getByHandle(static::$sectionsRootLocation) : null
            ]);
        }

        if (!empty($row['StudentsCapacity'])) {
            $Section->StudentsCapacity = $row['StudentsCapacity'];
        }

        if (!empty($row['Notes'])) {
            $Section->Notes = $row['Notes'];
        }


        // set title
        $title = null;
        if (!empty($row['Title'])) {
            $title = $row['Title'];
        }

        if ($title) {
            if (is_callable(static::$sectionTitleFormatter)) {
                $title = call_user_func(static::$sectionTitleFormatter, $title, $Record, $Teacher);
            }

            $Section->Title = $title;
        }


        // check section term
        if ($Section->Term->Left < $MasterTerm->Left || $Record->Term->Left > $MasterTerm->Right) {
            throw new RemoteRecordInvalid(
                'term-outside-master',
                sprintf('Term "%s" is not within the selected master term', $row['Term']),
                $row,
                $row['Term']
            );
        }


        // call configurable hook
        if (is_callable(static::$onApplySectionChanges)) {
            call_user_func(static::$onApplySectionChanges, $Job, $Section, $row);
        }
    }

    protected static function _getOrCreateParticipant(Section $Section, IPerson $User, array $data)
    {
        $Participant = SectionParticipant::getByWhere([
            'CourseSectionID' => $Section->ID,
            'PersonID' => $User->ID
        ]);

        if (!$Participant) {
            $Participant = SectionParticipant::create([
                'Section' => $Section,
                'Person' => $User
            ]);
        }

        $Participant->setFields($data);

        return $Participant;
    }

    protected static function _logParticipant(IJob $Job, SectionParticipant $Participant)
    {
        return $Job->logRecordDelta($Participant, [
            'messageRenderer' => function($logEntry) {
                $User = $logEntry['record']->Person;
                $Section = $logEntry['record']->Section;
                $Role = $logEntry['record']->Role;

                if ($logEntry['action'] == 'create') {
                    return sprintf('Adding user %s to section %s with role %s', $User->getTitle(), $Section->getTitle(), $Role);
                } else {
                    return sprintf('Updated user %s in section %s with role %s', $User->getTitle(), $Section->getTitle(), $Role);
                }
            }
        ]);
    }
}
