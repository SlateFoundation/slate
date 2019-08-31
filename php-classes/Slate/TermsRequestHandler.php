<?php

namespace Slate;

class TermsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = 'Slate\\Term';
    public static $browseLimit = false;
    public static $browseOrder = ['Left' => 'ASC'];

    public static function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case '*years':
                return static::handleYearsRequest();
            default:
                return parent::handleRecordsRequest($action);
        }
    }

    public static function handleYearsRequest()
    {
        return static::respond('years', [
            'success' => true
            ,'data' => Term::getAllByWhere(
                ['ParentID IS NULL']
                ,['order' => ['Left' => 'DESC']]
            )
        ]);
    }

    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        if (!empty($_GET['includeCurrent'])) {
            $currentTerm = Term::getCurrent();
            $reportingTerm = Term::getCurrentReporting();

            $responseData['currentTerm'] = $currentTerm ? $currentTerm->ID : null;
            $responseData['reportingTerm'] = $reportingTerm ? $reportingTerm->ID : null;
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }
}