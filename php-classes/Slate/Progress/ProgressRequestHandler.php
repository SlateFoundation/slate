<?php
namespace Slate\Progress;

use DB;
use Emergence\People\PeopleRequestHandler;
use Slate\TermsRequestHandler;


class ProgressRequestHandler extends \RequestHandler
{
    /**
     * Report classes must implement IStudentReport or IStudentTermReport
     */
    public static $reportClasses = [
        SectionTermReport::class,
        SectionInterimReport::class,
        Note::class
    ];

    public static $userResponseModes = [
        'application/json' => 'json',
        'application/pdf' => 'pdf',
        'text/html; display=print' => 'print'
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
        if (!empty($_REQUEST['classes'])) {
            $recordClasses = is_string($_REQUEST['classes']) ? explode(',', $_REQUEST['classes']) : $_REQUEST['classes'];

            foreach ($recordClasses AS $recordClass) {
                if (!in_array($recordClass, static::$reportClasses)) {
                    return static::throwNotFoundError('class not found');
                }
            }
        } else {
            $recordClasses = static::$reportClasses;
        }

        // compile results from each type
        $records = [];
        $foundClasses = [];

        foreach ($recordClasses as $recordClass) {
            $isTermReport = is_a($recordClass, IStudentTermReport::class, true);

            if ($Term && $Student) {
                $foundRecords = $isTermReport ? $recordClass::getAllByStudentTerm($Student, $Term) : null;
            } elseif ($Term) {
                $foundRecords = $isTermReport ? $recordClass::getAllByTerm($Term) : null;
            } elseif ($Student) {
                $foundRecords = $recordClass::getAllByStudent($Student);
            } else {
                $foundRecords = $recordClass::getAll();
            }

            if (!empty($foundRecords)) {
                $records = array_merge($records, $foundRecords);
                $foundClasses[] = $recordClass;
            }
        }

        // build cache of timestamps for quick sorting with no modification violations
        $recordTimestamps = [];
        foreach ($records AS $Record) {
            $recordTimestamps[$Record->getRootClass()][$Record->ID] = $Record->getTimestamp();
        }

        // apply unified sorting across all types
        usort($records, function ($r1, $r2) use($recordTimestamps) {
            return $recordTimestamps[$r2->getRootClass()][$r2->ID] - $recordTimestamps[$r1->getRootClass()][$r1->ID];
        });

        // return results and list of included types
        return static::respond('progress', [
            'data' => $records,
            'recordClasses' => $foundClasses,
            'term' => $Term,
            'student' => $Student
        ]);
    }
}