<?php

namespace Emergence\Locations;

#use DB;

class LocationsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = 'Emergence\\Locations\\Location';
    public static $browseLimit = false;
    public static $browseOrder = ['Left' => 'ASC'];
    
    public static function handleRecordsRequest($action = false)
    {
        switch($action = $action ? $action : static::shiftPath()) {
            case 'tree': 
                return static::handleTreeRequest();
            default: 
                return parent::handleRecordsRequest($action);
        }    
    }

    public static function handleTreeRequest()
    {
        $options = [];
        if ($_REQUEST['Class']) {
            $conditions['Class'] = $_REQUEST['Class'];
        }

        if (!empty($_REQUEST['parentLocation'])) {
            if ($_REQUEST['parentLocation'] != 'all') {
                $conditions['ParentID'] = $_REQUEST['parentLocation'];
            }
        } elseif($_REQUEST['parentLocation'] != 'all') {
            $conditions['ParentID'] = NULL;
        }

        if (!empty($_REQUEST['q'])) {
            $conditions[] = 'Title LIKE "%' . DB::escape($_REQUEST['q']) . '%"';
        }
        
        //this functino doesnt't accept null but it will accept an empty array
        return parent::handleBrowseRequest($options, $conditions);
    }
}