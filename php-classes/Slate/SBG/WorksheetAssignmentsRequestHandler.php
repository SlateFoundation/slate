<?php

namespace Slate\SBG;

use Slate\Term;

class WorksheetAssignmentsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = WorksheetAssignment::class;
    public static $accountLevelBrowse = 'Staff';

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

            $conditions['TermID'] = $Term->ID;
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }
}