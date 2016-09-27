<?php

namespace Emergence\People;

use LoginRequestHandler;


class RegistrationRequestHandler extends \RequestHandler
{
    // configurables
    public static $enableRegistration = true;
    public static $onRegisterComplete;
    public static $applyRegistrationData;
    public static $registrationFields = [
        'FirstName'
        ,'LastName'
        ,'Gender'
        ,'BirthDate'
        ,'Username'
        ,'Password'
        ,'Location'
        ,'About'
    ];

    public static function handleRequest()
    {
        switch ($action = static::shiftPath()) {
            case 'recover':
                return static::handleRecoverPasswordRequest();
            case 'set-password':
                return static::handleSetPasswordRequest();
            case '':
            case false:
                return static::handleRegistrationRequest();
            default:
                return static::throwNotFoundException();
        }
    }

    public static function handleRegistrationRequest($overrideFields = [])
    {
        if ($GLOBALS['Session']->PersonID) {
            return static::throwError('You are already logged in. Please log out if you need to register a new account.');
        }

        if (!static::$enableRegistration) {
            return static::throwError('Sorry, self-registration is not currently available. Please contact an administrator.');
        }

        $className = User::getStaticDefaultClass();
        $User = new $className();

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $requestFields = array_intersect_key($_REQUEST, array_flip(static::$registrationFields));

            // attach contact points
            if (!empty($_REQUEST['Email'])) {
                $User->PrimaryEmail = \Emergence\People\ContactPoint\Email::fromString($_REQUEST['Email']);
            }

            if (!empty($_REQUEST['Phone'])) {
                $User->PrimaryPhone = \Emergence\People\ContactPoint\Phone::fromString($_REQUEST['Phone']);
            }

            if (!empty($_REQUEST['Postal'])) {
                $User->PrimaryPostal = \Emergence\People\ContactPoint\Postal::fromString($_REQUEST['Postal']);
            }

            // save person fields
            $User->setFields(array_merge($requestFields, [
                'AccountLevel' => User::$fields['AccountLevel']['default']
            ], $overrideFields));

            if (!empty($_REQUEST['Password'])) {
                $User->setClearPassword($_REQUEST['Password']);
            }

            // additional checks
            $additionalErrors = [];
            if (empty($_REQUEST['Password']) || (strlen($_REQUEST['Password']) < User::$minPasswordLength)) {
                $additionalErrors['Password'] = 'Password must be at least '.User::$minPasswordLength.' characters long.';
            } elseif (empty($_REQUEST['PasswordConfirm']) || ($_REQUEST['Password'] != $_REQUEST['PasswordConfirm'])) {
                $additionalErrors['PasswordConfirm'] = 'Please enter your password a second time for confirmation.';
            }

            // configurable hook
            if (is_callable(static::$applyRegistrationData)) {
                call_user_func_array(static::$applyRegistrationData, [$User, $_REQUEST, &$additionalErrors]);
            }

            // validate
            if ($User->validate() && empty($additionalErrors)) {
                // save store
                $User->save();

                // upgrade session
                $GLOBALS['Session'] = $GLOBALS['Session']->changeClass('UserSession', [
                    'PersonID' => $User->ID
                ]);

                // send welcome email
                \Emergence\Mailer\Mailer::sendFromTemplate($User->EmailRecipient, 'registerComplete', [
                    'User' => $User
                ]);

                if (is_callable(static::$onRegisterComplete)) {
                    call_user_func(static::$onRegisterComplete, $User, $_REQUEST);
                }

                return static::respond('registerComplete', [
                    'success' => true
                    ,'data' => $User
                ]);
            }

            if (count($additionalErrors)) {
                $User->addValidationErrors($additionalErrors);
            }

            // fall through back to form if validation failed
        } else {
            // apply overrides to phantom
            $User->setFields($overrideFields);
        }

        return static::respond('register', [
            'success' => false
            ,'data' => $User
        ]);
    }


    public static function handleRecoverPasswordRequest()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $userClass = User::$defaultClass;

            if (empty($_REQUEST['username'])) {
                $error = 'Please provide either your username or email address to reset your password.';
            } elseif (!($User = $userClass::getByUsername($_REQUEST['username']))) {
                $error = 'No account is currently registered for that username or email address.';
            } elseif (!$User->PrimaryEmail) {
                $error = 'Unforunately, there is no email address on file for this account. Please contact an administrator.';
            } else {
                $Token = \PasswordToken::create([
                    'CreatorID' => $User->ID
                ], true);

                $Token->sendEmail($User->PrimaryEmail->toRecipientString());

                return static::respond('recoverPasswordComplete', [
                    'success' => true
                ]);
            }
        }

        return static::respond('recoverPassword', [
            'error' => isset($error) ? $error : false
        ]);
    }

    public static function handleSetPasswordRequest()
    {
        $GLOBALS['Session']->requireAuthentication();
        $User = $GLOBALS['Session']->Person;

        if (!$User->TemporaryPassword || !$User->verifyPassword($User->TemporaryPassword)) {
            return static::throwInvalidRequestError('Since your account is no longer using a temporary password, please visit your profile and confirm your current password to change it');
        }

        $error = null;
        $returnUrl = LoginRequestHandler::getReturnUrl();

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            if (empty($_POST['password']) || (strlen($_POST['password']) < User::$minPasswordLength)) {
                $error = 'Your new password must be at least '.User::$minPasswordLength.' characters long.';
            } elseif (empty($_POST['passwordConfirm']) || ($_POST['password'] != $_POST['passwordConfirm'])) {
                $error = 'Please enter your new password a second time for confirmation.';
            } else {
                $User->setClearPassword($_POST['password']);
                $User->save();

                return static::respond('setPasswordComplete', [
                    'success' => true,
                    'returnUrl' => $returnUrl
                ]);
            }
        }

        return static::respond('setPassword', [
            'success' => !$error,
            'error' => $error,
            'returnUrl' => $returnUrl
        ]);
    }
}