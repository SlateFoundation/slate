<?php

namespace Slate\Courses;

use HandleBehavior;

class Course extends \VersionedRecord
{
    // VersionedRecord configuration
    public static $historyTable = 'history_courses';

    // ActiveRecord configuration
    public static $tableName = 'courses';
    public static $singularNoun = 'course';
    public static $pluralNoun = 'courses';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);
    public static $collectionRoute = '/courses';

    public static $fields = array(
        'Title' => array(
            'fulltext' => true
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

    public static $relationships = array(
        'Department' => array(
            'type' => 'one-one'
            ,'class' => 'Slate\\Courses\\Department'
        )
        ,'Sections' => array(
            'type' => 'one-many'
            ,'class' => 'Slate\\Courses\\Section'
        )
    );

    public static $dynamicFields = array(
        'Department' => 'Department'
    );


    public function getHandle()
    {
        return $this->Code;
    }

    public static function getByHandle($handle)
    {
        return static::getByCode($handle);
    }

    public static function getByCode($code)
    {
        return static::getByField('Code', $code);
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