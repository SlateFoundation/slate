<?php

namespace Emergence\People;

use DB;
use Site;
use Slate;
use Emergence\Mailer\Mailer;
use Emergence\People\Person;
use Emergence\People\User;

class InvitationsRequestHandler extends \RequestHandler
{
    public static $messageVariables = [];
    public static $getMessageVariables;

    public static $userResponseModes = [
        'application/json' => 'json'
    ];

    public static function handleRequest()
    {
        switch (static::shiftPath()) {
            case 'variables':
                return static::handleVariablesRequest();
            case 'preview':
                return static::handlePreviewRequest();
            case 'send':
                return static::handleSendRequest();
            case 'accept':
                return static::handleAcceptRequest();
            default:
                return static::throwInvalidRequestError();
        }
    }

    public static function handleVariablesRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');

        if (empty($_REQUEST['personId']) || !($Recipient = Person::getByID($_REQUEST['personId']))) {
            return static::throwInvalidRequestError('personId required');
        }

        // create phantom invitation
        $Invitation = Invitation::create([
            'Recipient' => $Recipient
        ]);

        return static::respond('preview', [
            'success' => true,
            'data' => static::_getMessageVariables($Invitation)
        ]);
    }

    public static function handlePreviewRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');

        if (empty($_REQUEST['personId']) || !($Recipient = Person::getByID($_REQUEST['personId']))) {
            return static::throwInvalidRequestError('personId required');
        }

        // create phantom invitation
        $Invitation = Invitation::create([
            'Recipient' => $Recipient
        ]);

        $emailData = Mailer::renderTemplate('loginInvitation', [
            'Sender' => $GLOBALS['Session']->Person,
            'Invitation' => $Invitation,
            'message' => static::_getMessageFromTemplate($_REQUEST['message'], $Invitation)
        ]);

        $emailData['to'] = $Recipient->EmailRecipient;

        return static::respond('preview', $emailData);
    }

    public static function handleSendRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');

        if (empty($_POST['people']) || !is_array($_POST['people'])) {
            return static::throwInvalidRequestError('people required');
        }

        // pre-flight loop over people to ensure they're all valid
        $people = [];
        foreach (array_unique($_POST['people']) AS $personID) {
            if (!is_numeric($personID) || !($Person = Person::getByID($personID))) {
                return static::throwInvalidRequestError('One or more of the requested invitation recipients was not found in the database.');
            }

            if (!$Person->Email) {
                return static::throwInvalidRequestError('One or more of the requested invitation recipients does not have an email address on record.');
            }

            $people[] = $Person;
        }

        // create and send invitations
        foreach ($people AS $Person) {
            // revoke any existing
            try {
                DB::nonQuery(
                    'UPDATE `%s` SET Status = "Revoked" WHERE RecipientID = %u AND Status = "Pending"',
                    [
                        Invitation::$tableName,
                        $Person->ID
                    ]
                );
            } catch (\TableNotFoundException $e) {}

            // create new invitation
            $Invitation = Invitation::create([
                'Recipient' => $Person
            ], true);

            // send email
            Mailer::sendFromTemplate($Person->EmailRecipient, 'loginInvitation', [
                'Sender' => $GLOBALS['Session']->Person,
                'Invitation' => $Invitation,
                'message' => static::_getMessageFromTemplate($_REQUEST['message'], $Invitation)
            ]);
        }

        return static::respond('invitationsSent', [
            'success' => true,
            'sent' => count($people)
        ]);
    }

    public static function handleAcceptRequest()
    {
        if (!$invitationCode = static::shiftPath()) {
            return static::throwInvalidRequestError();
        }

        if ($invitationCode == 'preview') {
            $GLOBALS['Session']->requireAccountLevel('Staff');
            $Recipient = $GLOBALS['Session']->Person;
        } elseif ($Invitation = Invitation::getByHandle($invitationCode)) {
            if ($Invitation->Status != 'Pending') {
                return static::throwError('This invitation has already been used or was revoked, it is most likely that you have already used it or a newer one has been sent.');
            }

            if ($GLOBALS['Session']->Person) {
                return static::throwError('Unable to accept login invitation, you are already logged into an account.');
            }

            $Recipient = $Invitation->Recipient;
        } else {
            return static::throwNotFoundError('This invitation token was not found, please check that you have navigated to the entire URL that was sent to you.');
        }

        $error = false;

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            if (empty($_POST['Password']) || empty($_POST['PasswordConfirm']) || $_POST['Password'] != $_POST['PasswordConfirm']) {
                $error = 'Please choose a password for your account and enter it twice, you either left a field blank or your entries did not match.';
            } else {

                // promote person to user and set password
                if ($Recipient->Class == Person::class) {
                    $Recipient = $Recipient->changeClass(User::class);
                }

                if ($Recipient->AccountLevel == 'Contact') {
                    $Recipient->AccountLevel = 'User';
                }

                $Recipient->setClearPassword($_POST['Password']);
                $Recipient->save();

                // consume invitation
                $Invitation->Status = 'Used';
                $Invitation->save();

                // log user in
                $GLOBALS['Session'] = $GLOBALS['Session']->changeClass('UserSession', [
                    'PersonID' => $Recipient->ID
                ]);

                return static::respond('accountActivated', [
                    'success' => true,
                    'Invitation' => $Invitation
                ]);
            }
        }

        return static::respond('accept', [
            'Invitation' => $Invitation,
            'Recipient' => $Recipient,
            'error' => $error
        ]);
    }

    protected static function _getMessageFromTemplate($messageTemplate, Invitation $Invitation)
    {
        $messageVariables = static::_getMessageVariables($Invitation);

        return str_ireplace(
            array_map(
                function($key) {
                    return '{'.$key.'}';
                },
                array_keys($messageVariables)
            ),
            array_values($messageVariables),
            $messageTemplate
        );
    }

    protected static function _getMessageVariables($Invitation)
    {
        $messageVariables = static::$messageVariables;

        if (is_callable(static::$getMessageVariables)) {
            $messageVariables = array_merge($messageVariables, call_user_func(static::$getMessageVariables, $Invitation));
        }

        $hostname = Site::getConfig('primary_hostname');
        $messageVariables = array_merge($messageVariables, [
            'schoolName' => Slate::$schoolName,
            'schoolAbbr' => Slate::$schoolAbbr,
            'siteSlogan' => Slate::$siteSlogan,
            'recipientFirst' => $Invitation->Recipient->FirstName,
            'recipientLast' => $Invitation->Recipient->LastName,
            'recipientEmail' => $Invitation->Recipient->Email,
            'recipientUsername' => $Invitation->Recipient->Username,
            'websiteHostname' => $hostname,
            'websiteLink' => '<a href="http://'.$hostname.'">'.$hostname.'</a>'
        ]);

        return $messageVariables;
    }
}