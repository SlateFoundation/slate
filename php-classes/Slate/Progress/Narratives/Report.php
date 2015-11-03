<?php

namespace Slate\Progress\Narratives;

use DuplicateKeyException;

class Report extends \VersionedRecord
{
    
    // VersionedRecord configuration
    static public $historyTable = 'history_narrative_reports';

    // ActiveRecord configuration
    static public $tableName = 'narrative_reports';
    static public $singularNoun = 'narrative report';
    static public $pluralNoun = 'narrative reports';
    static public $updateOnDuplicateKey = true;
    static public $trackModified = true;
    
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
        ,'Updated' => array(
            'type' => 'timestamp'
            ,'notnull' => false
        )

        // TODO: comment out so sites can configure
        ,'Grade' => array(
            'type' => 'enum'
            ,'values' => array('A','B','C','D','F','Inc')
            ,'notnull' => false
        )
        ,'Assessment' => array(
            'type' => 'clob'
            ,'notnull' => false
        )
        ,'Comments' => array(
            'type' => 'clob'
            ,'notnull' => false
        )
    );
    
    
    static public $indexes = array(
        'NarrativeReport' => array(
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

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);
        
        $this->_validator->validate([
            'field' => 'Grade',
            'validator' => 'selection',
            'choices' => static::getFieldOptions('Grade', 'values'),
            'required' => ($this->Status=='Published'),
            'errorMessage' => 'Grade is require before publishing'
        ]);
        
        // save results
        return $this->finishValidation();
    }
}