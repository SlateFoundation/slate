<?php

namespace Slate\Courses;

use HandleBehavior;

class Course extends \VersionedRecord
{
    // VersionedRecord configuration
    static public $historyTable = 'history_courses';

    // ActiveRecord configuration
    static public $tableName = 'courses';
    static public $singularNoun = 'course';
    static public $pluralNoun = 'courses';

    // required for shared-table subclassing support
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array(__CLASS__);
    static public $collectionRoute = '/courses';

    static public $fields = array(
        'Title' => array(
            'fulltext' => true
        )
        ,'Handle' => array(
            'unique' => true
        )
        ,'Code' => array(
            'unique' => true
        )
        ,'Status' => array(
            'type' => 'enum'
            ,'values' => array('Hidden','Live','Deleted')
            ,'default' => 'Live'
        )
        ,'Description' => array(
            'type' => 'clob'
            ,'fulltext' => true
            ,'notnull' => false
        )
        ,'Prerequisites' => array(
            'type' => 'clob'
            ,'notnull' => false
        )
        ,'DepartmentID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        )
    );

    static public $relationships = array(
        'Department' => array(
            'type' => 'one-one'
            ,'class' => 'Slate\\Courses\\Department'
        )
        ,'Sections' => array(
            'type' => 'one-many'
            ,'class' => 'Slate\\Courses\\Section'
        )
    );
    
    static public $dynamicFields = array(
        'Department' => 'Department'
    );


    static public function getByHandle($handle)
    {
        return static::getByField('Handle', $handle, true);
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        $this->_validator->validate(array(
            'field' => 'Title'
            ,'errorMessage' => 'A title is required'
        ));

        // implement handles
        HandleBehavior::onValidate($this, $this->_validator);

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true, $createRevision = true)
    {
        // implement handles
        HandleBehavior::onSave($this);

        // call parent
        parent::save($deep, $createRevision);
    }
}