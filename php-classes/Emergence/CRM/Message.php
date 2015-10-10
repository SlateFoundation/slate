<?php

namespace Emergence\CRM;

use DuplicateKeyException;
use Emergence\People\ContactPoints\Email;

class Message extends \VersionedRecord
{
    public static $subjectFormat = '%s';
    public static $forwardPrefixFormat = "Forwarded by <a href=\"mailto:%s\">%s</a>:<hr/>\n";

    // VersionedRecord configuration
    public static $historyTable = 'history_messages';

    // ActiveRecord configuration
    public static $tableName = 'messages';
    public static $singularNoun = 'message';
    public static $pluralNoun = 'messages';

    public static $subClasses = [__CLASS__];

    public static $fields = [
        'ContextClass' => [
            'type' => 'enum',
            'values' => [
                \Emergence\People\Person::class
            ]
        ],
        'ContextID' => 'uint',
        'AuthorID' => 'uint',
        'Subject',
        'Message' => 'clob',
        'MessageFormat' => [
            'type' => 'enum',
            'values' => ['plain', 'html']
        ],

       'Status' => [
            'type' => 'enum',
            'values' => ['draft-private', 'draft-shared', 'sent', 'deleted'],
            'default' => 'draft-private'
        ],
        'ParentMessageID' => [
            'type' => 'uint',
            'notnull' => false
        ],
        'Source' => [
            'type' => 'enum',
            'values' => ['system', 'direct', 'email', 'import'],
            'default' => 'direct'
        ],

        'Sent' => [
            'type' => 'timestamp',
            'notnull' => false
        ]
    ];


    public static $relationships = [
        'Context' => [
            'type' => 'context-parent'
        ],
        'Author' => [
            'type' => 'one-one',
            'class' => \Emergence\People\Person::class
        ],
        'ParentMessage' => [
            'type' => 'one-one',
            'class' => __CLASS__
        ],
        'Recipients' => [
            'type' => 'one-many',
            'class' => MessageRecipient::class,
            'foreign' => 'MessageID'
        ]
    ];

    public static $dynamicFields = [
        'Context',
        'Author',
        'ParentMessage',
        'Recipients'
    ];

    public static $validators = [
        'Subject' => [
            'required' => true,
            'errorMessage' => 'A subject is required'
        ],
        'Message' => [
            'required' => true,
            'validator' => 'string_multiline',
            'errorMessage' => 'A message is required'
        ]
    ];

    public static $searchConditions = [
        'Subject' => [
            'qualifiers' => ['any','subject','Subject'],
            'points' => 2,
            'sql' => 'Subject LIKE "%%%s%%"'
        ],
        'Message' => [
            'qualifiers' => ['any','message','Message'],
            'points' => 2,
            'sql' => 'Message LIKE "%%%s%%"'
        ],
        'Person' => [
            'qualifiers' => ['person','personId', 'personID'],
            'points' => 2,
            'sql' => 'ContextClass = "Person" AND ContextID = "%u"'
        ],
        'Author' => [
            'qualifiers' => ['any','author'],
            'points' => 2,
            'sql' => 'AuthorID = (SELECT Author.ID FROM people Author WHERE Author.Username = "%s")'
        ]
    ];

    public function addRecipient(\Emergence\People\Person $Person, \Emergence\People\ContactPoint\Email $EmailContactPoint)
    {
        try {
            $MsgRecipient = MessageRecipient::create([
                'MessageID' => $this->ID,
                'PersonID' => $Person->ID,
                'EmailContactID' => $EmailContactPoint->ID
            ], true);
        } catch (DuplicateKeyException $e) {
            $MsgRecipient = MessageRecipient::getByWhere([
                'MessageID' => $this->ID,
                'PersonID' => $Person->ID
            ]);
        }

        return $MsgRecipient;
    }

    public function save($deep = true)
    {
        if (!$this->Sent && $this->Status == 'sent') {
            $this->Sent = time();
        }

        if (!$this->Author) {
            $Author = $this->getUserFromEnvironment();
            $this->AuthorID = $Author ? $Author->ID : null;
        }

        parent::save($deep);
    }

    public function send()
    {
        $newEmailRecipients = [];

        foreach ($this->Recipients AS $Recipient) {
            if ($Recipient->Status == 'pending') {
                $Recipient->Status = 'sent';
                $newEmailRecipients[] = $Recipient;
            }
        }

        if (!count($newEmailRecipients)) {
            return 0;
        }
        error_reporting(E_ALL);
        $success = \Emergence\Mailer\Mailer::send(
            $this->getEmailRecipientsList($newEmailRecipients),
            $this->getEmailSubject(),
            $this->getEmailBody(),
            $this->getEmailFrom(),
            $this->getEmailHeaders()
        );

        if ($success) {
            $this->Status = 'sent';
            $this->save();

            return count($newEmailRecipients);
        } else {
            print_r(error_get_last());
            throw new \Exception('Failed to inject message into email system');
        }
    }


    public function getEmailRecipientsList($recipients = false)
    {
        if (!is_array($recipients)) {
            $recipients = $this->Recipients;
        }

        return array_map(function($Recipient) {
            if (!$Recipient->EmailContactID || $Recipient->Person->PrimaryEmailID == $Recipient->EmailContactID) {
                return $Recipient->Person->EmailRecipient;
            } else {
                $Email = \Emergence\People\ContactPoint\Email::getByID($Recipient->EmailContactID);

                return $Email->toRecipientString();
            }
        }, $recipients);
    }

    public function getEmailSubject()
    {
        return sprintf(static::$subjectFormat, $this->Subject);
    }

    public function getEmailBody()
    {
        $Sender = $GLOBALS['Session']->Person;

        if ($Sender->ID != $this->AuthorID) {
            return sprintf(static::$forwardPrefixFormat, $Sender->Email, $Sender->FullName).$this->Message;
        } else {
            return $this->Message;
        }
    }

    public function getEmailFrom()
    {
        return $this->Author->EmailRecipient;
    }

    public function getEmailHeaders()
    {
        $replyTo = $this->getEmailRecipientsList();

        if (!in_array($this->Author->EmailRecipient, $replyTo)) {
            $replyTo[] = $this->Author->EmailRecipient;
        }

        return [
            'Reply-To: '.implode(', ', $replyTo),
            'X-MessageID: '.$this->ID
        ];
    }
}