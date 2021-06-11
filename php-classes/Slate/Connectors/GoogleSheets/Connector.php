<?php

namespace Slate\Connectors\GoogleSheets;

use Exception;
use SpreadsheetReader;

use Emergence\Connectors\Exceptions\RemoteRecordInvalid;
use Emergence\Connectors\IJob;
use Emergence\Connectors\Mapping;

use Emergence\People\User;
use Slate\People\Student;

class Connector extends \Slate\Connectors\AbstractSpreadsheetConnector implements \Emergence\Connectors\ISynchronize
{
    // AbstractConnector overrides
    public static $title = 'Google Sheets';
    public static $connectorId = 'google-sheets';


    // workflow implementations
    protected static function _getJobConfig(array $requestData)
    {
        $config = parent::_getJobConfig($requestData);

        $config['studentsCsv'] = !empty($requestData['studentsCsv']) ? $requestData['studentsCsv'] : null;
        $config['alumniCsv'] = !empty($requestData['alumniCsv']) ? $requestData['alumniCsv'] : null;
        $config['staffCsv'] = !empty($requestData['staffCsv']) ? $requestData['staffCsv'] : null;
        $config['sectionsCsv'] = !empty($requestData['sectionsCsv']) ? $requestData['sectionsCsv'] : null;
        $config['enrollmentsCsv'] = !empty($requestData['enrollmentsCsv']) ? $requestData['enrollmentsCsv'] : null;

        return $config;
    }

    public static function synchronize(IJob $Job, $pretend = true)
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
        $results = [];


        // execute tasks based on available spreadsheets
        $readerOptions = [
            'arrayValues' => true
        ];

        if (!empty($Job->Config['studentsCsv'])) {
            $results['pull-students'] = static::pullStudents(
                $Job,
                SpreadsheetReader::createFromStream(fopen($Job->Config['studentsCsv'], 'r'), 'text/csv', $readerOptions),
                $pretend
            );
        }

        if (!empty($Job->Config['alumniCsv'])) {
            $results['pull-alumni'] = static::pullAlumni(
                $Job,
                SpreadsheetReader::createFromStream(fopen($Job->Config['alumniCsv'], 'r'), 'text/csv', $readerOptions),
                $pretend
            );
        }

        if (!empty($Job->Config['staffCsv'])) {
            $results['pull-staff'] = static::pullStaff(
                $Job,
                SpreadsheetReader::createFromStream(fopen($Job->Config['staffCsv'], 'r'), 'text/csv', $readerOptions),
                $pretend
            );
        }

        if (!empty($Job->Config['sectionsCsv'])) {
            $results['pull-sections'] = static::pullSections(
                $Job,
                SpreadsheetReader::createFromStream(fopen($Job->Config['sectionsCsv'], 'r'), 'text/csv', $readerOptions),
                $pretend
            );
        }

        if (!empty($Job->Config['enrollmentsCsv'])) {
            $results['pull-enrollments'] = static::pullEnrollments(
                $Job,
                SpreadsheetReader::createFromStream(fopen($Job->Config['enrollmentsCsv'], 'r'), 'text/csv', $readerOptions),
                $pretend
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

    protected static function _applyStudentUserChanges(IJob $Job, User $User, array $row, array &$results)
    {
        parent::_applyUserChanges($Job, $User, $row, $results);

        if ($User->AccountLevel == 'Disabled') {
            $User->AccountLevel = 'User';
        }
    }
}
