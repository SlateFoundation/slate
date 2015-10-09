<?php

namespace Slate\Progress;

class Note extends \Emergence\CRM\Message
{
    public static $subjectFormat = '[PROGRESS NOTE] %s: %s';
    public static $archiveMailboxFormat = false;

    public static $pdfTemplate = 'notes/print';


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

    public function getEmailRecipientsList($recipients = false)
    {
        $recipients = parent::getEmailRecipientsList($recipients);

        if (static::$archiveMailboxFormat) {
            array_unshift($recipients, sprintf(static::$archiveMailboxFormat, $this->Context->Username));
        }

        return $recipients;
    }

    public function getEmailSubject()
    {
        return sprintf(static::$subjectFormat, $this->Context->FullName, $this->Subject);
    }

    //TODO: migrate to $validators ?
    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        if (!$this->Context || !$this->Context->isA(\Emergence\People\User::class)) {
            $this->_validator->addError('Context', 'Progress note must be in the context of a user');
        }

        // save results
        return $this->finishValidation();
    }
}