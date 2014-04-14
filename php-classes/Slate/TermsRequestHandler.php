<?php

namespace Slate;

class TermsRequestHandler extends \RecordsRequestHandler
{
    static public $recordClass = 'Slate\\Term';
    static public $browseLimit = false;
    static public $browseOrder = array('Left' => 'ASC');

    static public function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case '*years':
                return static::handleYearsRequest();
            default:
                return parent::handleRecordsRequest($action);
        }
    }

    static public function handleYearsRequest()
    {
        return static::respond('years', array(
            'success' => true
            ,'data' => Term::getAllByWhere(
                array('ParentID IS NULL')
                ,array('order' => array('Left' => 'DESC'))
            )
        ));
    }

    static public function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
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