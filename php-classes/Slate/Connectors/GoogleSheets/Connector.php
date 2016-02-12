<?php

namespace Slate\Connectors\GoogleSheets;

use SpreadsheetReader;
use Emergence\Connectors\Job;

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

        if (!empty($Job->Config['alumniCsv'])) {
            $results['pull-alumni'] = static::pullAlumni(
                $Job,
                $pretend,
                SpreadsheetReader::createFromStream(fopen($Job->Config['alumniCsv'], 'r'))
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
}