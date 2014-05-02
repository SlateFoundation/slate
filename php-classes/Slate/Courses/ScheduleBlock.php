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
    public static $subClasses = array(__CLASS__);

    public static $fields = array(
        'ScheduleID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        )

        ,'StartOffset' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )
        ,'EndOffset' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )

        ,'Status' => array(
            'type' => 'enum'
            ,'values' => array('Hidden','Live','Deleted')
            ,'default' => 'Live'
        )

        ,'Title' => array(
            'notnull' => false
        )
        ,'Description' => array(
            'type' => 'clob'
            ,'notnull' => false
        )
    );

    public static $relationships = array(
        'Schedule' => array(
            'type' => 'one-one'
            ,'class' => 'Slate\\Courses\\Schedule'
        )
    );
}