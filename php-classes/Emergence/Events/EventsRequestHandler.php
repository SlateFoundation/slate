<?php

namespace Emergence\Events;

class EventsRequestHandler extends \RecordsRequestHandler
{
    // RecordRequestHandler configuration
    public static $recordClass = '\Emergence\Events\Event';
    public static $accountLevelRead = false;
    public static $accountLevelBrowse = false;
    public static $accountLevelWrite = 'Staff';
    public static $browseOrder = ['StartTime'];
    public static $browseConditions = [
        'StartTime >= CURRENT_TIMESTAMP'
    ];

    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        // allow staff to download all articles via JSON
        if ($GLOBALS['Session']->hasAccountLevel('Staff') && static::$responseMode == 'json') {
            static::$browseConditions = false;
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }
}