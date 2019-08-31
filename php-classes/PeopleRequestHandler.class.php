<?php

use Emergence\People\Groups\Group;
use Emergence\People\IPerson;
use Emergence\People\IUser;


class PeopleRequestHandler extends RecordsRequestHandler
{
    public static $personClass = Person::class;
    public static $userClass = User::class;
    public static $groupClass = Group::class;

    // RecordRequestHandler configuration
    public static $recordClass = Person::class;
    public static $browseOrder = [
        'LastName' => 'ASC',
        'FirstName' => 'ASC'
    ];

    public static function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case '*classes':
                return static::handleClassesRequest();
            case '*account-levels':
                return static::handleAccountLevelsRequest();
            default:
                return parent::handleRecordsRequest($action);
        }
    }

    public static function handleClassesRequest()
    {
        $personClass = static::$personClass;
        $userClass = static::$userClass;

        $interface = empty($_GET['interface']) || $_GET['interface'] != 'user' ? IPerson::class : IUser::class;
        $baseClass = $interface == IPerson::class ? $personClass : $userClass;

        $classes = array_values(array_filter(Person::getSubClasses(), function($class) use ($interface) {
            return is_a($class, $interface, true);
        }));

        $defaultClass = $baseClass::getDefaultClass();
        $defaultPersonClass = $personClass::getDefaultClass();
        $defaultUserClass = $userClass::getDefaultClass();

        return static::respond('classes', array(
            'data' => array_map(function ($class) use ($defaultClass, $defaultPersonClass, $defaultUserClass) {
                return [
                    'name' => $class,
                    'label' => $class::$classLabel,
                    'interfaces' => array_values(class_implements($class)),
                    'default' => $class == $defaultClass,
                    'personDefault' => $class == $defaultPersonClass,
                    'userDefault' => $class == $defaultUserClass
                ];
            }, $classes),
            'default' => $defaultClass,
            'personDefault' => $defaultPersonClass,
            'userDefault' => $defaultUserClass
        ));
    }

    public static function handleAccountLevelsRequest()
    {
        return static::respond('account-levels', array(
            'data' => User::getFieldOptions('AccountLevel', 'values'),
            'default' => User::getFieldOptions('AccountLevel', 'default')
        ));
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
        $groupClass = static::$groupClass;

        if (isset($requestData['groupIDs'])) {
            $groupClass::setPersonGroups($Person, $requestData['groupIDs']);
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
            case 'temporary-password':
            case '*temporary-password':
                return static::handleTemporaryPasswordRequest($Person);
            case 'thumbnail':
                return static::handleThumbnailRequest($Person);
            default:
                return parent::handleRecordRequest($Person, $action);
        }
    }

    public static function handleTemporaryPasswordRequest(IPerson $Person)
    {
        $GLOBALS['Session']->requireAccountLevel('Administrator');

        if (!$Person instanceof IUser) {
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

    public static function handleThumbnailRequest(IPerson $Person)
    {
        return MediaRequestHandler::handleThumbnailRequest($Person->PrimaryPhoto ? $Person->PrimaryPhoto : Media::getBlank('person'));
    }
}