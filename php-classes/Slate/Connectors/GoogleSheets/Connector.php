<?php

namespace Slate\Connectors\GoogleSheets;

use SpreadsheetReader;
use Emergence\Connectors\IJob;

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
}
