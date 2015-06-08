<?php

namespace Slate\Assets;

use DB;

class StatusesRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = 'Slate\\Assets\\Status';
    
    public static $browseConditians = array('Status' => 'Active');

    public static function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
    {
        if ($_REQUEST['sort']) {
            unset($_REQUEST['sort']);
        }

        if (!empty($_REQUEST['parentStatus']) && $_REQUEST['parentStatus'] != 'any' && $_REQUEST['parentStatus'] != 'NaN') {
            $conditions['ParentID'] = $_REQUEST['parentStatus'];
        } else if ($_REQUEST['parentStatus'] != 'any') {
            $conditions['ParentID'] = NULL;
        }

        if (!empty($_REQUEST['q'])) {
            $conditions[] = 'Title LIKE "%' . DB::escape($_REQUEST['q']) . '%"';
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }

    public static function getRecordByHandle($handle)
    {
        $recordClass = static::$recordClass;
        $escapedHandle = DB::escape($handle);

        if( is_numeric($handle)) {
            $Record = $recordClass::getByID($escapedHandle);
        } else {
            $Record = $recordClass::getByField('Handle', $escapedHandle);
        }

        return $Record ?: null;
    }
}