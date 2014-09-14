<?php

namespace Emergence\Locations;

#use DB;

class LocationsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = 'Emergence\\Locations\\Location';
    public static $browseLimit = false;
    public static $browseOrder = ['Left' => 'ASC'];

#    public static function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
#    {
#        if ($_REQUEST['Class']) {
#            $conditions['Class'] = $_REQUEST['Class'];
#        }
#
#        if (!empty($_REQUEST['parentLocation'])) {
#            if ($_REQUEST['parentLocation'] != 'all') {
#                $conditions['ParentID'] = $_REQUEST['parentLocation'];
#            }
#        } elseif($_REQUEST['parentLocation'] != 'all') {
#            $conditions['ParentID'] = NULL;
#        }
#
#        if (!empty($_REQUEST['q'])) {
#            $conditions[] = 'Title LIKE "%' . DB::escape($_REQUEST['q']) . '%"';
#        }
#
#        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
#    }
}