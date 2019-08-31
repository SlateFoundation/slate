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
    public static $subClasses = [__CLASS__];
    public static $collectionRoute = '/courses';

    public static $fields = [
        'Title' => [
            'fulltext' => true
        ]
        ,'Code' => [
            'unique' => true
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
        ,'Prerequisites' => [
            'type' => 'clob'
            ,'notnull' => false
        ]
        ,'DepartmentID' => [
            'type' => 'uint'
            ,'notnull' => false
        ]
    ];

    public static $relationships = [
        'Department' => [
            'type' => 'one-one'
            ,'class' => Department::class
        ]
        ,'Sections' => [
            'type' => 'one-many'
            ,'class' => Section::class
        ]
    ];

    public static $dynamicFields = [
        'Department' => 'Department'
    ];

    public static $validators = [
        'Title'
    ];


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
}