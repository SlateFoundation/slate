<?php

namespace Slate\Courses;

class ScheduleBlock extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'course_schedule_blocks';
    public static $singularNoun = 'course schedule block';
    public static $pluralNoun = 'course schedule blocks';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    public static $fields = [
        'ScheduleID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        ]

        ,'StartOffset' => [
            'type' => 'integer'
            ,'unsigned' => true
        ]
        ,'EndOffset' => [
            'type' => 'integer'
            ,'unsigned' => true
        ]

        ,'Status' => [
            'type' => 'enum'
            ,'values' => ['Hidden','Live','Deleted']
            ,'default' => 'Live'
        ]

        ,'Title' => [
            'notnull' => false
        ]
        ,'Description' => [
            'type' => 'clob'
            ,'notnull' => false
        ]
    ];

    public static $relationships = [
        'Schedule' => [
            'type' => 'one-one'
            ,'class' => 'Slate\\Courses\\Schedule'
        ]
    ];
}