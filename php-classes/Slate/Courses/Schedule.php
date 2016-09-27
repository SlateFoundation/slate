<?php

namespace Slate\Courses;

use HandleBehavior;

class Schedule extends \VersionedRecord
{
    // VersionedRecord configuration
    public static $historyTable = 'history_course_schedules';

    // ActiveRecord configuration
    public static $tableName = 'course_schedules';
    public static $singularNoun = 'course schedule';
    public static $pluralNoun = 'course schedules';
    public static $collectionRoute = '/schedules';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    public static $fields = [
        'Title' => [
            'fulltext' => true
            ,'notnull' => false
        ]
        ,'Handle' => [
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
            'errorMessage' => 'A title is required',
            'required' => false
        ]
    ];

    public static $relationships = [
        'Blocks' => [
            'type' => 'one-many'
            ,'class' => ScheduleBlock::class
        ]
    ];


    public static function getOrCreateByHandle($handle, $save = false)
    {
        if ($Schedule = static::getByHandle($handle)) {
            return $Schedule;
        } else {
            return static::create([
                'Title' => $handle
                ,'Handle' => $handle
            ], $save);
        }
    }

    public static function getOrCreateByTitle($title, $save = false)
    {
        if ($Schedule = static::getByField('Title', $title)) {
            return $Schedule;
        } else {
            return static::create([
                'Title' => $title
            ], $save);
        }
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        // implement handles
        HandleBehavior::onValidate($this, $this->_validator);

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
    {
        // implement handles
        HandleBehavior::onSave($this, preg_replace('/\s+/', '', $this->Title), [
            'case' => null
        ]);

        // call parent
        parent::save($deep);
    }
}