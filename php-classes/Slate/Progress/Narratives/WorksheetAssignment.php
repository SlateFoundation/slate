<?php
namespace Slate\Progress\Narratives;

class WorksheetAssignment extends \ActiveRecord
{
    // ActiveRecord configuration
	static public $tableName = 'narratives_worksheet_assignments';
	static public $rootClass = __CLASS__;
	static public $defaultClass = __CLASS__;
	static public $subClasses = array(__CLASS__);
	
	static $fields = array(
		'ContextClass' => null
		,'ContextID' => null
		,'Description' => array(
			'type' => 'clob'
			,'notnull' => false
		)
 		,'TermID' => array(
			'type' => 'integer'
			,'unsigned' => true
		)
		,'CourseSectionID' => array(
			'type' => 'integer'
			,'unsigned' => true
		)
		,'WorksheetID' => array(
			'type' => 'integer'
			,'unsigned' => true
		)
	);

	public static $relationships = array(
		'Term' => array(
			'type' => 'one-one'
			,'class' => \Slate\Term::class
		)
		,'CourseSection' => array(
			'type' => 'one-one'
			,'class' => \Slate\Courses\Section::class
		)
		,'Worksheet' => array(
			'type' => 'one-one'
			,'class' => \Slate\Standards\Worksheet::class
		)
	);
	
	public static $dynamicFields = [
    	'Term',
    	'CourseSection',
    	'Worksheet'
	];

	static public $indexes = array(
		'WorksheetAssignment' => array(
			'fields' => array('TermID','CourseSectionID')
			,'unique' => true
		)
	);
	
	public function save($deep=true)
	{
		
		if($this->isPhantom && !$this->TermID)
			$this->TermID =  $this->CourseSection->TermID;
			
		parent::save($deep);
	}
	
	
	public function getData()
	{
		return array_merge(parent::getData(), array(
			'CourseSection' => $this->CourseSection ? $this->CourseSection->getData() : NULL
			,'Worksheet' => $this->Worksheet ? $this->Worksheet->getData() : NULL
		));
	}

}