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

    public static $fields = [
        'Title' => [
            'fulltext' => true
        ]
        ,'Handle' => [
            'unique' => true
        ]
        ,'Code' => [
            'unique' => true
            ,'notnull' => false
        ]

        ,'Status' => [
            'type' => 'enum'
            ,'values' => ['Hidden','Live','Deleted']
            ,'default' => 'Live'
        ]

        ,'Description' => [
            'type' => 'clob'
            ,'fulltext' => true
            ,'notnull' => false
        ]
    ];

    public static $validators = [
        'Title' => [
            'errorMessage' => 'A title is required'
        ]
    ];

    public static $relationships = [
        'Courses' => [
            'type' => 'one-many'
            ,'class' => 'Slate\\Courses\\Course'
            ,'foreign' => 'DepartmentID'
        ]
    ];


    public static function getOrCreateByTitle($title, $save = false)
    {
        if ($Department = static::getByField('Title', $title)) {
            return $Department;
        } else {
            return static::create([
                'Title' => $title
            ], $save);
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
