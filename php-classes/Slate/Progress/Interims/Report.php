<?php

namespace Slate\Progress\Interims;

class Report extends \VersionedRecord
{
    // VersionedRecord configuration
    static public $historyTable = 'history_interim_reports';

	// ActiveRecord configuration
	static public $tableName = 'interim_reports';
	static public $singularNoun = 'interim report';
	static public $pluralNoun = 'interim reports';
	
	// required for shared-table subclassing support
	static public $rootClass = __CLASS__;
	static public $defaultClass = __CLASS__;
	static public $subClasses = array(__CLASS__);

	static public $fields = array(
		'StudentID' => array(
			'type' => 'integer'
			,'unsigned' => true
		)
		,'CourseSectionID' => array(
			'type' => 'integer'
			,'unsigned' => true
		)
		,'TermID' => array(
			'type' => 'integer'
			,'unsigned' => true
		)

		,'Status' => array(
			'type' => 'enum'
			,'values' => array('Draft','Published')
			,'default' => 'Draft'
		)
		
		,'Grade' => array(
			'type' => 'enum'
			,'values' => array('D','F','N/A')
			,'notnull' => false
		)
		,'Comments' => array(
			'type' => 'clob'
			,'notnull' => false
		)
        ,'Saved' => array(
            'type' => 'timestamp'
            ,'notnull' => false
        )
	);
	
	
	static public $indexes = array(
		'InterimReport' => array(
			'fields' => array('StudentID','CourseSectionID','TermID')
			,'unique' => true
		)
	);
	
	static $relationships = array(
		'Section' => array(
			'type' => 'one-one'
			,'class' => \Slate\Courses\Section::class
			,'local' => 'CourseSectionID'
		)
		,'Student' => array(
			'type' => 'one-one'
			,'class' => \Slate\People\Student::class
		)
		,'Term' => array(
			'type' => 'one-one'
			,'class' => \Slate\Term::class
		)
	);
	
	static public $searchConditions = array(
		'Status' => array(
			'qualifiers' => array('status')
			,'points' => 2
			,'sql' => 'Status="%s"'
		)
		,'Term' => array(
			'qualifiers' => array('term')
			,'points' => 2
			,'callback' => 'getTermSearchSQL'
		)
		,'StudentID' => array(
			'qualifiers' => array('studentid')
			,'points' => 2
			,'sql' => 'StudentID = %u'
		)
		,'AdvisorID' => array(
			'qualifiers' => array('advisorid')
			,'points' => 2
			,'callback' => 'getAdivsorIDSearchSQL'
		)
		,'AuthorID' => array(
			'qualifiers' => array('authorid')
			,'points' => 2
			,'sql' => 'CreatorID = %u'
		)
	);
	
	public static $dynamicFields = [
    	'Section',
    	'Student',
    	'Term'
	];
	
	static public function getAdivsorIDSearchSQL($advisorId)
	{
		$peopleIds = \DB::allValues(
			'ID'
			,'SELECT ID FROM people WHERE AdvisorID = %u'
			,array($advisorId)
		);
		
		return 'StudentID In ('.implode(',', $peopleIds).')';
	}
	
	static public function getTermSearchSQL($termId)
	{
		$Term = \Slate\Term::getById($termId);
		
		$termIds =  $Term->getContainedTermIDs();
		
		return 'TermID IN ('.implode(',',$termIds).')';
	}

	
	public function validate($deep = true)
	{
		// call parent
		parent::validate($deep);
		
		$this->_validator->validate(array(
			'field' => 'Grade'
			,'validator' => 'selection'
			,'choices' => self::$fields['Grade']['values']
			,'required' => ($this->Status=='Published')
			,'errorMessage' => 'Grade is require before publishing'
		));
		
		// save results
		return $this->finishValidation();
	}
	
	public function save($deep = true, $createRevision = true)
	{
        if($this->isDirty)
        {
            $this->Saved = time();
        }
        
		try
		{
			// call parent
			parent::save($deep, $createRevision);
		}
		catch(\DuplicateKeyException $e)
		{
			// duplicate create save! apply update to existing record
			$Existing = static::getByWhere(array(
				'StudentID' => $this->StudentID
				,'CourseSectionID' => $this->CourseSectionID
				,'TermID' => $this->TermID
			));

			$Existing->setFields($this->_record);
			
			$Existing->save();
			
			// clone existing record's data
			$this->_record = $Existing->_record;
		}
	}
	
#	static public function createProgressNote($Interim)
#	{
#		$relationships = array(
#			'Father'
#			,'Mother'
#			,'Foster Father'
#			, 'Foster Mother'
#			,'Guardian'
#		);
#		
#		$Student = Student::getByID($Interim->StudentID);
#		$Section = CourseSection::getByWhere(array('ID'=>$Interim->CourseSectionID));
#		
#		$subject = sprintf('[Interim Report]%s: %s', $Student->FullName, $Section->Title);
#		
#		$body = $Student->FullName. ' has recieved a '.$Interim->Grade.' in '.$Section->Title.' for the '.$Interim->Term->Title.'.';
#		$body .=' '.$Interim->Comments;
#		
#		
#		$guardians = Relationship::getAllByWhere(array(
#			'PersonID' => $Student->ID
#			,'Relationship IN ("'.implode('","', $relationships).'")'
#		));
#		
#		$recipients = array();
#			
#		foreach($guardians as $guardian)
#		{
#			$recipients[] = $guardian->RelatedPerson->EmailRecipient;
#		}
#		
#		MICS::dump($recipients);
#	}
}