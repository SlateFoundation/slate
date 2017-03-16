<?php
namespace Slate\Progress;

use DB;
use Emergence\People\Person;
use Slate\Term;

class ProgressRequestHandler extends \RequestHandler
{

    public static $reportClasses = [
        'termreports' => SectionTermReport::class,
        'narratives' => SectionTermReport::class,// backwards compat
        'interims' => SectionInterimReport::class,
        'progressnotes' => Note::class
    ];

    public static $userResponseModes = [
        'application/json' => 'json',
        'application/pdf' => 'pdf'
    ];

    public static function handleRequest()
    {
        return static::handleProgressRequest();
    }

    public static function handleProgressRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');

        if (!$_REQUEST['StudentID'] || !ctype_digit($_REQUEST['StudentID'])) {
            return static::throwError('Must supply Student ID');
        }

        $params = [
            'StudentID' => $_REQUEST['StudentID']
        ];

        if (!empty($_REQUEST['TermID'])) {
            if (is_numeric($_REQUEST['TermID'])) {
                $term = Term::getByID($_REQUEST['TermID']);
            } else {
                $term = Term::getCurrent();
            }
        } else {
            $term = null;
        }
        
        if (!empty($_REQUEST['summarize'])) {
            $summarizeRecords = true;
        } else {
            $summarizeRecords = false;
        }

        $reportTypes = is_string($_REQUEST['reportTypes']) ? [$_REQUEST['reportTypes']] : $_REQUEST['reportTypes'];

        if (empty($reportTypes)) {
            return static::throwError('Must supply report types');
        }

        $reportClasses = static::$reportClasses;
        $records = [];
        $recordTypes = [];
        
        foreach ($reportTypes as $reportType) {
            if (array_key_exists($reportType, $reportClasses)) {
                $reports = $reportClasses[$reportType]::getAllByTerm($term, $params, $summarizeRecords);
                $records = array_merge($records, $reports);
                
                if (!empty($reports)) {
                    $recordTypes[] = $reportClasses[$reportType];
                }
            }
        }

        usort($records, function($r1, $r2) {

            if (is_object($r1)) {
                $date1 = $r1->Created;
            } else {
                $date1 = $r1['Date'];
            }

            if (is_object($r2)) {
                $date2 = $r2->Created;
            } else {
                $date2 = $r2['Date'];
            }

            return (strtotime($date1) - strtotime($date2));
        });
        
        return static::respond('progress', [
            'data' => $records,
            'recordTypes' => $recordTypes
        ]);
    }
}