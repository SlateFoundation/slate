<?php

namespace Slate\Progress;

class Note extends \Emergence\CRM\Message
{
    static public $subjectFormat = '[PROGRESS NOTE] %s: %s';
	static public $archiveMailboxFormat = false;
	
	static public $pdfTemplate = 'notes/print';
	
	
	static public $searchConditions = array(
		'Subject' => array(
			'qualifiers' => array('any','subject','Subject')
			,'points' => 2
			,'sql' => 'Subject LIKE "%%%s%%"'
		)
    	,'Message' => array(
			'qualifiers' => array('any','message','Message')
			,'points' => 2
			,'sql' => 'Message LIKE "%%%s%%"'
		)
		,'Person' => array(
			'qualifiers' => array('person','personId', 'personID')
			,'points' => 2
			,'sql' => 'ContextClass = "Person" AND ContextID = "%u"'
		)
		,'Author' => array(
			'qualifiers' => array('any','author')
			,'points' => 2
			,'sql' => 'AuthorID = (SELECT Author.ID FROM people Author WHERE Author.Username = "%s")'
		)
	);
    
    //TODO: Implement emergence proxy to use dynimac fields instead
    public function getData()
    {
        return array_merge(parent::getData(), [
            'Author' => $this->Author ? $this->Author->getData() : null    
        ]);
    }

	public function getEmailRecipientsList($recipients = false)
	{
		$recipients = parent::getEmailRecipientsList($recipients);
		
		if(static::$archiveMailboxFormat)
		{
			array_unshift($recipients, sprintf(static::$archiveMailboxFormat, $this->Context->Username));
		}
		
		return $recipients;
	}

	public function getEmailSubject()
	{
		return sprintf(static::$subjectFormat, $this->Context->FullName, $this->Subject);
	}
    
    
    //TODO: add to $validators ?
	public function validate($deep = true)
	{
		// call parent
		parent::validate($deep);

		if(!$this->Context || !$this->Context->isA(\Emergence\People\User::class))
		{
			$this->_validator->addError('Context', 'Progress note must be in the context of a user');
		}
		
		// save results
		return $this->finishValidation();
	}
}