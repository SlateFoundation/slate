<?php

namespace Emergence\Events;

class EventsRequestHandler extends \RecordsRequestHandler
{
    // RecordRequestHandler configuration
    static public $recordClass = '\Emergence\Events\Event';
    static public $accountLevelRead = false;
    static public $accountLevelBrowse = false;
    static public $accountLevelWrite = 'Staff';
    static public $browseOrder = array('StartTime');
    static public $browseConditions = array(
        'StartTime >= CURRENT_TIMESTAMP'
    );

    static public function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
    {
        // allow staff to download all articles via JSON
        if ($GLOBALS['Session']->hasAccountLevel('Staff') && static::$responseMode == 'json') {
            static::$browseConditions = false;
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }
}