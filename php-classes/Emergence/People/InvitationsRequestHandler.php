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

    public static $invitationClass = Invitation::class;

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
                return static::handleBrowseRequest();
        }
    }

    public static function handleBrowseRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');
        $invitationClass = static::$invitationClass;
        $conditions = [];

        if (empty($_GET['status']) || $_GET['status'] == 'pending') {
            $conditions['Status'] = 'Pending';
        } elseif ($_GET['status'] == 'used') {
            $conditions['Status'] = 'Used';
        } elseif ($_GET['status'] == 'revoked') {
            $conditions['Status'] = 'Revoked';
        }

        if (!empty($_GET['recipient'])) {
            $recipients = is_array($_GET['recipient']) ? $_GET['recipient'] : explode(',', $_GET['recipient']);
            $recipientIds = [];

            foreach ($recipients as $recipient) {
                if (!$Person = PeopleRequestHandler::getRecordByHandle($recipient)) {
                    return static::throwNotFoundError("Person $recipient not found");
                }

                $recipientIds[] = $Person->ID;
            }

            $conditions[] = 'RecipientID IN ('.implode(',', $recipientIds).')';
        }

        return static::respond('invitations', [
            'data' => $invitationClass::getAllByWhere($conditions)
        ]);
    }

    public static function handleVariablesRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');
        $invitationClass = static::$invitationClass;

        if (empty($_REQUEST['personId']) || !($Recipient = Person::getByID($_REQUEST['personId']))) {
            return static::throwInvalidRequestError('personId required');
        }

        // create phantom invitation
        $Invitation = $invitationClass::create([
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
        $invitationClass = static::$invitationClass;

        if (empty($_REQUEST['personId']) || !($Recipient = Person::getByID($_REQUEST['personId']))) {
            return static::throwInvalidRequestError('personId required');
        }

        // create phantom invitation
        $Invitation = $invitationClass::create([
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
        $invitationClass = static::$invitationClass;

        $requestData = \JSON::getRequestData() ?: $_POST;

        if (empty($requestData['people']) || !is_array($requestData['people'])) {
            return static::throwInvalidRequestError('people required');
        }

        // remove script time limit
        set_time_limit(0);

        // pre-flight loop over people to ensure they're all valid
        $people = [];
        foreach ($requestData['people'] AS $invitation) {
            if (is_numeric($invitation)) {
                $invitation = [
                    'PersonID' => $invitation,
                    'UserClass' => $invitationClass::getFieldOptions('UserClass', 'default')
                ];
            }

            if (!is_numeric($invitation['PersonID']) || !($Person = Person::getByID($invitation['PersonID']))) {
                return static::throwInvalidRequestError('One or more of the requested invitation recipients was not found in the database.');
            }

            if (!$Person->Email) {
                return static::throwInvalidRequestError('One or more of the requested invitation recipients does not have an email address on record.');
            }

            $people[$Person->ID] = [
                'Recipient' => $Person,
                'UserClass' => $invitation['UserClass']
            ];
        }

        // create and send invitations
        foreach ($people AS $invitationData) {
            // try to find an existing pending invitation first
            $Invitation = $invitationClass::getByWhere([
                'RecipientID' => $invitationData['Recipient']->ID,
                'Status' => 'Pending'
            ]);

            if ($Invitation) {
                $Invitation->UserClass = $invitationData['UserClass'];
                $Invitation->save();
            } else {
                // create new invitation
                $Invitation = $invitationClass::create($invitationData, true);
            }

            // send email
            Mailer::sendFromTemplate($Invitation->Recipient->EmailRecipient, 'loginInvitation', [
                'Sender' => $GLOBALS['Session']->Person,
                'Invitation' => $Invitation,
                'message' => static::_getMessageFromTemplate($requestData['message'], $Invitation)
            ]);
        }

        return static::respond('invitationsSent', [
            'success' => true,
            'sent' => count($people)
        ]);
    }

    public static function handleAcceptRequest()
    {
        $invitationClass = static::$invitationClass;

        if (!$invitationCode = static::shiftPath()) {
            return static::throwInvalidRequestError();
        }

        if ($invitationCode == 'preview') {
            $GLOBALS['Session']->requireAccountLevel('Staff');
            $Recipient = $GLOBALS['Session']->Person;
        } elseif ($Invitation = $invitationClass::getByHandle($invitationCode)) {
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
                    $Recipient = $Recipient->changeClass($Invitation->UserClass);
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