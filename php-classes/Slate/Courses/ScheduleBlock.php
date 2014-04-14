<?php

namespace Slate\Courses;

class ScheduleBlock extends \ActiveRecord
{
    // ActiveRecord configuration
    static public $tableName = 'course_schedule_blocks';
    static public $singularNoun = 'course schedule block';
    static public $pluralNoun = 'course schedule blocks';

    // required for shared-table subclassing support
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array(__CLASS__);

    static public $fields = array(
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

    static public $relationships = array(
        'Schedule' => array(
            'type' => 'one-one'
            ,'class' => 'Slate\\Courses\\Schedule'
        )
    );
}