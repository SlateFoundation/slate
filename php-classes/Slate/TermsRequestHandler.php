<?php

namespace Slate;

class TermsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = 'Slate\\Term';
    public static $browseLimit = false;
    public static $browseOrder = array('Left' => 'ASC');

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
        return static::respond('years', array(
            'success' => true
            ,'data' => Term::getAllByWhere(
                array('ParentID IS NULL')
                ,array('order' => array('Left' => 'DESC'))
            )
        ));
    }

    public static function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
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