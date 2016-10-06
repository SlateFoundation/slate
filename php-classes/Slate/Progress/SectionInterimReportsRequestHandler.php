<?php

namespace Slate\Progress;

use Slate\Term;
use Slate\Courses\Section;
use Slate\People\Student;


class SectionInterimReportsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = SectionInterimReport::class;

    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        if (!empty($_REQUEST['term'])) {
            if ($_REQUEST['term'] == 'current') {
                if (!$Term = Term::getClosest()) {
                    return static::throwInvalidRequestError('No current term could be found');
                }
            } elseif (!$Term = Term::getByHandle($_REQUEST['term'])) {
                return static::throwNotFoundError('term not found');
            }

            $conditions[] = sprintf('TermID IN (%s)', join(',', $Term->getRelatedTermIDs()));
            $responseData['term'] = $Term;
        }

        if (!empty($_REQUEST['course_section'])) {
            if (!$Section = Section::getByHandle($_REQUEST['course_section'])) {
                return static::throwNotFoundError('course_section not found');
            }

            $conditions['SectionID'] = $Section->ID;
            $responseData['course_section'] = $Section;
        }

        if (!empty($_REQUEST['students'])) {
            $studentIds = [];

            foreach (Student::getAllByListIdentifier($_REQUEST['students']) AS $Student) {
                $studentIds[] = $Student->ID;
            }

            $conditions[] = sprintf('StudentID IN (%s)', count($studentIds) ? join(',', $studentIds) : '0');
        }

        if (!empty($_REQUEST['status'])) {
            if (!in_array($_REQUEST['status'], Report::getFieldOptions('Status', 'values'))) {
                return static::throwInvalidRequestError('Invalid status');
            }

            $conditions['Status'] = $_REQUEST['status'];
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }
}