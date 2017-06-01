<?php
namespace Slate\Progress;

use DB;
use Emergence\People\PeopleRequestHandler;
use Slate\TermsRequestHandler;


class ProgressRequestHandler extends \RequestHandler
{
    public static $reportClasses = [
        SectionTermReport::class,
        SectionInterimReport::class,
        Note::class
    ];

    public static $userResponseModes = [
        'application/json' => 'json',
        'application/pdf' => 'pdf'
    ];

    public static function handleRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');

        // get term filter
        if (!empty($_REQUEST['term'])) {
            if (!$Term = TermsRequestHandler::getRecordByHandle($_REQUEST['term'])) {
                return static::throwNotFoundError('term not found');
            }
        }

        // get student filter
        if (!empty($_REQUEST['student'])) {
            if (!$Student = PeopleRequestHandler::getRecordByHandle($_REQUEST['student'])) {
                return static::throwNotFoundError('student not found');
            }
        } else {
            return static::throwInvalidRequestError('student required');
        }

        // get types filter
        if (!empty($_REQUEST['types'])) {
            $recordTypes = is_string($_REQUEST['types']) ? explode(',', $_REQUEST['types']) : $_REQUEST['types'];

            foreach ($recordTypes AS $recordType) {
                if (!in_array($recordType, static::$reportClasses)) {
                    return static::throwNotFoundError('type not found');
                }
            }
        } else {
            $recordTypes = static::$reportClasses;
        }

        // compile results from each type
        $records = [];
        $foundTypes = [];

        foreach ($recordTypes as $recordType) {
            if ($Term && $Student) {
                $foundRecords = $recordType::getAllByStudentTerm($Student, $Term);
            } elseif ($Term) {
                $foundRecords = $recordType::getAllByTerm($Term);
            } elseif ($Student) {
                $foundRecords = $recordType::getAllByStudent($Student);
            } else {
                $foundRecords = $recordType::getAll();
            }

            if (!empty($foundRecords)) {
                $records = array_merge($records, $foundRecords);
                $foundTypes[] = $recordType;
            }
        }

        // build cache of timestamps for quick sorting with no modification violations
        $recordTimestamps = [];
        foreach ($records AS $Record) {
            $recordTimestamps[$Record->ID] = $Record->getTimestamp();
        }

        // apply unified sorting across all types
        usort($records, function ($r1, $r2) use($recordTimestamps) {
            return $recordTimestamps[$r2->ID] - $recordTimestamps[$r1->ID];
        });

        // return results and list of included types
        return static::respond('progress', [
            'data' => $records,
            'recordTypes' => $foundTypes,
            'term' => $Term,
            'student' => $Student
        ]);
    }
}