<?php

namespace Emergence\People;

class PeopleRequestHandler extends \RecordsRequestHandler
{
    // RecordRequestHandler configuration
    public static $recordClass = 'Emergence\People\Person';

    public static function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case '*classes':
                return static::respond('classes', array(
                    'data' => Person::getStaticSubClasses()
                    ,'default' => Person::getStaticDefaultClass()
                ));
            case '*account-levels':
                return static::respond('account-levels', array(
                    'data' => User::getFieldOptions('AccountLevel', 'values')
                    ,'default' => User::getFieldOptions('AccountLevel', 'default')
                ));
            default:
                return parent::handleRecordsRequest($action);
        }
    }

    public static function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
    {
        if ($_REQUEST['q'] != 'all') {
            $conditions[] = 'AccountLevel != "Disabled"';
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }

    protected static function onRecordSaved(\ActiveRecord $Person, $requestData)
    {
        if (isset($requestData['groupIDs'])) {
            \Emergence\People\Groups\Group::setPersonGroups($Person, $requestData['groupIDs']);
        }
    }

    public static function getRecordByHandle($handle)
    {
        if (ctype_digit($handle) || is_int($handle)) {
            return Person::getByID($handle);
        } else {
            return User::getByUsername($handle);
        }
    }
    
    static public function respondCsv($responseID, $responseData = array())
    {
        if (!empty($_REQUEST['downloadToken'])) {
            setcookie('downloadToken', $_REQUEST['downloadToken'], time()+300, '/');
        }

		if (is_array($responseData['data'])) {
            return \CSV::respond($responseData['data'], $responseID, !empty($_GET['columns']) ? $_GET['columns'] : null);
		} elseif ($responseID == 'error') {
			print($responseData['message']);
		} else {
			print 'Unable to render data to CSV: '.$responseID;
		}
		exit();
    }
}