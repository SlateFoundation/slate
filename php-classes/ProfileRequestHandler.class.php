<?php

use Emergence\People\Person;

class ProfileRequestHandler extends RequestHandler
{
    public static $profileFields = array('Location','About','Phone','Email');
    public static $accountLevelEditOthers = 'Staff';

    public static $onBeforeProfileValidated = false;
    public static $onBeforeProfileSaved = false;
    public static $onProfileSaved = false;

    public static $userResponseModes = array(
        'application/json' => 'json'
    );

    public static function handleRequest()
    {
        // route request
        switch ($action = strtolower(static::shiftPath())) {
            case 'uploadphoto':
                return static::handlePhotoUploadRequest();
            case 'primaryphoto':
                return static::handlePhotoPrimaryRequest();
            case 'deletephoto':
                return static::handlePhotoDeleteRequest();
            case 'password':
                return static::handlePasswordRequest();
            case 'view':
                return static::handleViewRequest();
            case '':
            case false:
                return static::handleEditRequest();
            default:
                return static::throwNotFoundError();
        }
    }

    public static function handleViewRequest()
    {
        $GLOBALS['Session']->requireAuthentication();

        return Site::redirect($GLOBALS['Session']->Person->getURL());
    }

    public static function handleEditRequest()
    {
        $GLOBALS['Session']->requireAuthentication();
        $User = static::_getRequestedUser();

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            if ($_SERVER['CONTENT_TYPE'] == 'application/json') {
                $requestData = JSON::getRequestData();
            } else {
                $requestData = $_REQUEST;
            }

            if (!$GLOBALS['Session']->hasAccountLevel('Administrator')) {
                $profileChanges = array_intersect_key($requestData, array_flip(static::$profileFields));
            } else {
                $profileChanges = $requestData;
            }

            $User->setFields($profileChanges);

            if (static::$onBeforeProfileValidated) {
                call_user_func(static::$onBeforeProfileValidated, $User, $profileChanges, $requestData);
            }

            // validate
            if ($User->validate()) {
                if (static::$onBeforeProfileSaved) {
                    call_user_func(static::$onBeforeProfileSaved, $User, $profileChanges, $requestData);
                }

                // save session
                $User->save();

                if (static::$onProfileSaved) {
                    call_user_func(static::$onProfileSaved, $User, $profileChanges, $requestData);
                }

                // fire created response
                return static::respond('profileSaved', array(
                    'success' => true
                    ,'data' => $User
                ));
            }

            // fall through back to form if validation failed
        }

        return static::respond('profileEdit', array(
            'data' => $User
        ));
    }

    public static function handlePhotoUploadRequest()
    {
        $GLOBALS['Session']->requireAuthentication();
        $User = static::_getRequestedUser();

        // process photo upload with MediaRequestHandler
        $Photo = \Media::createFromUpload($_FILES['photoFile'], array(
            'ContextClass' => $User->getRootClass()
            ,'ContextID' => $User->ID
            ,'Caption' => $User->FullName
        ));

        // set primary if none set
        if ($Photo && (!$User->PrimaryPhoto || !empty($_POST['primary']))) {
            $User->PrimaryPhoto = $Photo;
            $User->save();
        }

        return static::respond('profilePhotoUploaded', array(
            'success' => (boolean)$Photo
            ,'data' => $Photo
        ));
    }

    public static function handlePhotoPrimaryRequest()
    {
        $GLOBALS['Session']->requireAuthentication();
        $User = static::_getRequestedUser();

        if (empty($_REQUEST['MediaID']) || !is_numeric($_REQUEST['MediaID'])) {
            return static::throwInvalidRequestError();
        }

        if (!$Media = Media::getByID($_REQUEST['MediaID'])) {
            return static::throwNotFoundError();
        }

        if ($Media->ContextClass != $User->getRootClass() || $Media->ContextID != $User->ID) {
            return static::throwUnauthorizedError();
        }

        $User->PrimaryPhoto = $Media;
        $User->save();

        return static::respond('profilePhotoPrimaried', array(
            'success' => true
            ,'data' => $Media
        ));
    }

    public static function handlePhotoDeleteRequest()
    {
        $GLOBALS['Session']->requireAuthentication();
        $User = static::_getRequestedUser();

        if (empty($_REQUEST['MediaID']) || !is_numeric($_REQUEST['MediaID'])) {
            return static::throwInvalidRequestError();
        }

        if (!$Media = Media::getByID($_REQUEST['MediaID'])) {
            return static::throwNotFoundError();
        }

        if ($Media->ContextClass != $User->getRootClass() || $Media->ContextID != $User->ID) {
            return static::throwUnauthorizedError();
        }

        if ($User->PrimaryPhotoID == $Media->ID) {
            $User->PrimaryPhotoID = null;
            $User->save();
        }

        $Media->destroy();

        return static::respond('profilePhotoDeleted', array(
            'success' => true
            ,'data' => $Media
        ));
    }

    public static function handlePasswordRequest()
    {
        $GLOBALS['Session']->requireAuthentication();
        $User = static::_getRequestedUser();

        if (empty($_REQUEST['OldPassword'])) {
            return static::throwError('Enter your current password for verification');
        } elseif (!$User->verifyPassword($_REQUEST['OldPassword'])) {
            return static::throwError('You did not enter your current password correctly');
        } elseif (empty($_REQUEST['Password']) || empty($_REQUEST['PasswordConfirm'])) {
            return static::throwError('Enter your new password twice to change it');
        } elseif ($_REQUEST['Password'] != $_REQUEST['PasswordConfirm']) {
            return static::throwError('The passwords you supplied did not match');
        }

        $User->setClearPassword($_REQUEST['Password']);
        $User->save();

        return static::respond('passwordChanged', array(
            'success' => true
            ,'data' => $User
        ));
    }

    protected static function _getRequestedUser()
    {
        if (
            !empty($_GET['person']) &&
            static::$accountLevelEditOthers &&
            $GLOBALS['Session']->hasAccountLevel(static::$accountLevelEditOthers)
        ) {
            if (!$User = Person::getByID($_GET['person'])) {
                return static::throwNotFoundError('Person not found');
            }
        } else {
            $User = $GLOBALS['Session']->Person;
        }

        return $User;
    }
}