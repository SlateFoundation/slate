<?php

namespace Slate\Connectors\PCR;

use SpreadsheetReader;
use Emergence\Connectors\Job;


class Connector extends \Slate\Connectors\AbstractSpreadsheetConnector implements \Emergence\Connectors\ISynchronize
{
    // column maps
    public static $personForeignKeyName = 'student[alternate_id]';
    public static $studentColumns = [
        'alternate id' => 'ForeignKey',
        'student id' => 'StudentNumber',
        'student nickname' => 'PreferredName',
        'student first name' => 'FirstName',
        'student middle name' => 'MiddleName',
        'student last name' => 'LastName',
        'sex' => 'Gender',
        'year grad' => 'GraduationYear',
        'advisor first name' => 'AdvisorFirstName',
        'advisor last name' => 'AdvisorLastName'
    ];

    // AbstractConnector overrides
    public static $title = 'PCR';
    public static $connectorId = 'pcr';


    // workflow implementations
    protected static function _getJobConfig(array $requestData)
    {
        $config = parent::_getJobConfig($requestData);

        $config['studentsCsv'] = !empty($_FILES['students']) && $_FILES['students']['error'] === UPLOAD_ERR_OK ? $_FILES['students']['tmp_name'] : null;
        $config['sectionsCsv'] = !empty($_FILES['sections']) && $_FILES['sections']['error'] === UPLOAD_ERR_OK ? $_FILES['sections']['tmp_name'] : null;
        $config['schedulesCsv'] = !empty($_FILES['schedules']) && $_FILES['schedules']['error'] === UPLOAD_ERR_OK ? $_FILES['schedules']['tmp_name'] : null;

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
        $results = [];


        // execute tasks based on available spreadsheets
        if (!empty($Job->Config['studentsCsv'])) {
            $results['pull-students'] = static::pullStudents(
                $Job,
                $pretend,
                SpreadsheetReader::createFromStream(fopen($Job->Config['studentsCsv'], 'r'))
            );
        }

        if (!empty($Job->Config['sectionsCsv'])) {
            $results['pull-sections'] = static::pullSections(
                $Job,
                $pretend,
                SpreadsheetReader::createFromStream(fopen($Job->Config['sectionsCsv'], 'r'))
            );
        }

        if (!empty($Job->Config['schedulesCsv'])) {
            $results['pull-enrollments'] = static::pullEnrollments(
                $Job,
                $pretend,
                SpreadsheetReader::createFromStream(fopen($Job->Config['schedulesCsv'], 'r'))
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
}