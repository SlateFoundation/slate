<?php

namespace Slate\Assets;

use DB, TableNotFoundException;
use PeopleRequestHandler;
use Slate\Assets\Asset;

class TicketsRequestHandler extends \ActivityRecordsRequestHandler
{
    static public $recordClass = \Slate\Assets\Ticket::class;
    
    public static function handleRecordsRequest($action = false)
    {
        
        switch ($action = $action ? $action : static::shiftPath()) {
            case 'assignees':
            {
                return static::handleAssigneesRequest();
            }
            case 'statuses':
            {
                return static::handleStatusesRequest();
            }

            default:
                return parent::handleRecordsRequest($action);
        }

    }
    
    public static function handleAssigneesRequest()
    {
        $recordClass = static::$recordClass;
        
        try {            
            $assigneeIDs = \DB::allValues('AssigneeID', 'SELECT AssigneeID FROM `%s` WHERE 1', array($recordClass::$tableName));
        } catch (TableNotFoundException $e) {
            return static::respond('ticketAssignees', [
                'success' => true,
                'data' => [],
                'total' => 0
            ]);
        }

        return \PeopleRequestHandler::handleBrowseRequest(array(), array( 'ID' => array(
                'operator' => 'IN',
                'values' => $assigneeIDs
            )
        ));
    }
    
    public static function handleStatusesRequest($status = null)
    {
        $recordClass = static::$recordClass;
        
        if (!$status) {
            switch($path = static::peekPath() ?: $_REQUEST['Status'])
            {
                case 'Open':
                case 'Closed':
                    $status = $path;
                    break;
            }
        }   
        
        if ($status) {
           return static::handleBrowseRequest(array(), array('Status' => \DB::escape($status)), null, array('openTotal' => $recordClass::getOpenCount(), 'closedTotal' => $recordClass::getClosedCount())); 
        } else {
            return static::throwInvalidRequestError('Status paramater is missing or invalid.');
        }
    }
}