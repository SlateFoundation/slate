<?php

namespace Slate\Courses;

use HandleBehavior;

class Department extends \VersionedRecord
{
    // VersionedRecord configuration
    public static $historyTable = 'history_course_departments';

    // ActiveRecord configuration
    public static $tableName = 'course_departments';
    public static $singularNoun = 'course department';
    public static $pluralNoun = 'course departments';
    public static $collectionRoute = '/departments';

    public static $fields = array(
        'Title' => array(
            'fulltext' => true
        )
        ,'Handle' => array(
            'unique' => true
        )
        ,'Code' => array(
            'unique' => true
            ,'notnull' => false
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
    );

    public static $validators = [
        'Title' => [
            'errorMessage' => 'A title is required'
        ]
    ];

    public static $relationships = array(
        'Courses' => array(
            'type' => 'one-many'
            ,'class' => 'Slate\\Courses\\Course'
            ,'foreign' => 'DepartmentID'
        )
    );


    public static function getOrCreateByTitle($title)
    {
        if ($Department = static::getByField('Title', $title)) {
            return $Department;
        } else {
            return static::create(array(
                'Title' => $title
            ), true);
        }
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        // implement handles
        HandleBehavior::onValidate($this, $this->_validator);

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
    {
        // implement handles
        HandleBehavior::onSave($this);

        // call parent
        parent::save($deep);
    }
}