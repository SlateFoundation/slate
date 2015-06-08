<?php

namespace Slate\Assets;

use DB;
use PeopleRequestHandler;
use Slate\Assets\Ticket;
use TableNotFoundException;

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
    
    public static function handleQueryRequest($query, $conditions = array(), $options = array(), $responseID = null, $responseData = array(), $mode = 'AND')
    {
        $className = static::$recordClass;
        if(!empty($_REQUEST['sort'])) {
        	$dir = (empty($_REQUEST['dir']) || $_REQUEST['dir'] == 'ASC') ? 'ASC' : 'DESC';
			
			if($className::sorterExists($_REQUEST['sort'])) {
				$order = call_user_func($className::getSorter($_REQUEST['sort']), $dir, $_REQUEST['sort']);
			}
			elseif($className::fieldExists($_REQUEST['sort'])) {
				$order = array(
					$_REQUEST['sort'] => join(" ", [$_REQUEST['sort'], $dir])
				);
			}
			else {
				return static::throwError('Invalid sort field');
			}
		}
		else {
			$order = static::$browseOrder;
		}
#        \MICS::dump($order, 'order', true); 
        return parent::handleQueryRequest($query, $conditions, (!empty($order) && is_array($order)) ? array_merge(['order' => $order], $options) : $options, $responseID, $responseData, $mode);
    }
    
    public static function handleAssigneesRequest()
    {
        $recordClass = static::$recordClass;
        try {            
            $assigneeIDs = \DB::allValues('AssigneeID', 'SELECT DISTINCT AssigneeID FROM `%s` WHERE AssigneeID IS NOT NULL', array($recordClass::$tableName));
        } catch (TableNotFoundException $e) {
            $assigneeIDs = [];
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
           return static::handleBrowseRequest(array(), array('Status' => DB::escape($status)), null, array('openTotal' => $recordClass::getOpenCount(), 'closedTotal' => $recordClass::getClosedCount())); 
        } else {
            return static::respond('ticketStatusNodes', [
                'data' => [
                    [
                        'text' => 'Open',
                        'Class' => Ticket::class,
                        'ID' => 'open',
                        'leaf' => true,
                        'ticketsCount' => Ticket::getCount(['Status' => 'Open'])
                    ],[
                        'text' => 'Closed',
                        'Class' => Ticket::class,
                        'ID' => 'closed',
                        'leaf' => true,
                        'ticketsCount' => Ticket::getCount(['Status' => 'Closed'])
                    ]
                ],
                'success' => true,
                'total' => 2
            ]);
        }
    }
}