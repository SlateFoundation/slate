<?php

namespace Slate\Courses;

use Slate\TermsRequestHandler;

class SectionTermDataRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = SectionTermData::class;

    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelRead = 'Staff';
    public static $accountLevelAPI = 'Staff';


    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        if (!empty($_GET['course_section'])) {
            if (!$Section = SectionsRequestHandler::getRecordByHandle($_GET['course_section'])) {
                return static::throwNotFoundError('course_section not found');
            }

            $conditions['SectionID'] = $Section->ID;
        }

        if (!empty($_GET['term'])) {
            if ($_GET['term'] == '*current') {
                if (!$Term = Term::getClosest()) {
                    return static::throwInvalidRequestError('No current term could be found');
                }
            } elseif (!$Term = TermsRequestHandler::getRecordByHandle($_GET['term'])) {
                return static::throwNotFoundError('term not found');
            }

            $conditions[] = sprintf('TermID IN (%s)', join(',', $Term->getRelatedTermIDs()));
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }
}