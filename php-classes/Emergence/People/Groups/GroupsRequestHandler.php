<?php

namespace Emergence\People\Groups;

use DB;
use ActiveRecord;
use RecordsRequestHandler;

class GroupsRequestHandler extends RecordsRequestHandler
{
    public static $recordClass = 'Emergence\People\Groups\Group';
    public static $accountLevelRead = 'User';
    public static $browseOrder = array('Left' => 'ASC');

    public static function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
    {
        if (!empty($_REQUEST['parentGroup']) && $_REQUEST['parentGroup'] != 'any') {
            $conditions['ParentID'] = $_REQUEST['parentGroup'];
        } elseif ($_REQUEST['parentGroup'] != 'any') {
            $conditions['ParentID'] = NULL;
        }

        if ($_REQUEST['query']) {
            $conditions[] = sprintf('Name LIKE "%%%s%%"', DB::escape($_REQUEST['query']));
        }

        if (!empty($_REQUEST['q'])) {
            $conditions[] = 'Name LIKE "%'.DB::escape($_REQUEST['q']).'%"';
        }

        return parent::handleBrowseRequest($options, $conditions);
    }

    public static function handleRecordRequest(ActiveRecord $Group, $action = false)
    {
        switch ($action ? $action : static::shiftPath()) {
            case 'members':
                return static::handleMembersRequest($Group);
            default:
                return parent::handleRecordRequest($Group, $action);
        }
    }

    public static function handleMembersRequest(Group $Group)
    {
        return static::respond('members', array(
            'success' => true
            ,'data' => $Group->getAllPeople()
            ,'group' => $Group
        ));
    }
}
