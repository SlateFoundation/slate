<?php

namespace Emergence\CRM;

use JSON;
use Emergence\People\Person;
use Emergence\People\ContactPoints\Email;

class MessagesRequestHandler extends \RecordsRequestHandler
{
    // RecordsRequestHandler configuration
    public static $recordClass = 'Emergence\CRM\Message';
    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelRead = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelAPI = 'Staff';
    public static $browseOrder = ['ID' => 'DESC'];

    public static function handleRecordRequest(\ActiveRecord $Message, $action = false)
    {
        switch ($action ?: $action = static::shiftPath()) {
            case 'recipients':
                return static::handleMessageRecipientsRequest($Message);
            default:
                return parent::handleRecordRequest($Message, $action);
        }
    }

    public static function handleMessageRecipientsRequest(Message $Message)
    {
        if (in_array($_SERVER['REQUEST_METHOD'], ['POST','PUT'])) {
            if (0 === strpos($_SERVER['CONTENT_TYPE'], 'application/json')) {
                $_REQUEST = JSON::getRequestData();
            }

            if (empty($_REQUEST['data']) || !is_array($_REQUEST['data'])) {
                return static::throwInvalidRequestError('Save expects "data" field as array of record deltas');
            }

            $newPeople = [];

            foreach ($_REQUEST['data'] AS $recipientData) {
                if (!empty($recipientData['PersonID']) && is_numeric($recipientData['PersonID'])) {
                    // get by ID
                    if (!$RecipientPerson = Person::getByID($recipientData['PersonID'])) {
                        return static::throwNotFoundError('Recipient not found');
                    }
                } elseif (!empty($recipientData['FullName']) && !empty($recipientData['Email'])) {
                    // try to create custom person
                    $nameData = Person::parseFullName($recipientData['FullName']);

                    // try to get existing or create
                    if (!$RecipientPerson = Person::getByFullName($nameData['FirstName'], $nameData['LastName'])) {
                        $RecipientPerson = Person::create(array_merge($recipientData, $nameData), true);
                    }
                } else {
                    // fail
                    return static::throwInvalidRequestError('FullName or PersonID required');
                }

                if (!empty($recipientData['Email'])) {
                    $EmailContactPoint = \Emergence\People\ContactPoint\Email::getByWhere([
                        'PersonID' => $RecipientPerson->ID,
                        'Data' => $recipientData['Email']
                    ]);


                    if (!$EmailContactPoint) {
                        $EmailContactPoint = \Emergence\People\ContactPoint\Email::create([
                            'PersonID' => $RecipientPerson->ID
                        ]);

                        $EmailContactPoint->loadString($recipientData['Email']);
                        $EmailContactPoint->save();
                    }
                }

                $Message->addRecipient($RecipientPerson, $EmailContactPoint);

                if ($RecipientPerson->isNew) {
                    $newPeople[] = $RecipientPerson;
                }
            }

            // trigger send
            $Message->send();

            return static::respond('recipientsAdded', [
                'success' => true,
                'data' => $Message->Recipients,
                'newPeople' => $newPeople,
                'message' => $Message->getData()
            ]);
        }

        return static::respond('recipients', [
            'success' => true,
            'data' => $Message->Recipients
        ]);
    }
}