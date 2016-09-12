<?php

namespace Emergence\People;

use ActiveRecord;


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

    protected static function onRecordSaved(ActiveRecord $Person, $requestData)
    {
        if (isset($requestData['groupIDs'])) {
            Groups\Group::setPersonGroups($Person, $requestData['groupIDs']);
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

    public static function handleRecordRequest(ActiveRecord $Person, $action = false)
    {
        switch ($action ?: $action = static::shiftPath()) {
            case '*temporary-password':
                return static::handleTemporaryPasswordRequest($Person);
            default:
                return parent::handleRecordRequest($Person, $action);
        }
    }

    public static function handleTemporaryPasswordRequest(Person $Person, $action = false)
    {
        $GLOBALS['Session']->requireAccountLevel('Administrator');

        if (!$Person instanceof User) {
            return static::throwInvalidRequestError('only a user can have a temporary password');
        }

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $Person->setTemporaryPassword();
            $Person->save();
        }

        return static::respond('temporaryPassword', array(
            'success' => true,
            'temporaryPassword' => $Person->TemporaryPassword
        ));
    }
}