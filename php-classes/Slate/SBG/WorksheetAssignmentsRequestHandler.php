<?php

namespace Slate\SBG;

use Slate\Term;

class WorksheetAssignmentsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = WorksheetAssignment::class;
    public static $accountLevelBrowse = 'Staff';

    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        if (!empty($_REQUEST['termID'])) {
            $Term = Slate\Term::getByID($_REQUEST['termID']);
            $conditions[] = sprintf('TermID IN (%s)', join(',', $Term->getRelatedTermIDs()));
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }
}