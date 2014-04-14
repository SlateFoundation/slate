<?php

namespace Slate\Courses;

use HandleBehavior;

class Schedule extends \VersionedRecord
{
    // VersionedRecord configuration
    static public $historyTable = 'history_course_schedules';

    // ActiveRecord configuration
    static public $tableName = 'course_schedules';
    static public $singularNoun = 'course schedule';
    static public $pluralNoun = 'course schedules';

    // required for shared-table subclassing support
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array(__CLASS__);

    static public $fields = array(
        'Title' => array(
            'fulltext' => true
            ,'notnull' => false
        )
        ,'Handle' => array(
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


    static public $relationships = array(
        'Blocks' => array(
            'type' => 'one-many'
            ,'class' => 'Slate\\Courses\\ScheduleBlock'
            ,'foreign' => 'ScheduleID'
        )
    );


    static public function getByHandle($handle)
    {
        return static::getByField('Handle', $handle, true);
    }

    static public function getOrCreateByHandle($handle)
    {
        if ($Schedule = static::getByHandle($handle)) {
            return $Schedule;
        } else {
            return static::create(array(
                'Title' => $handle
                ,'Handle' => $handle
            ), true);
        }
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        $this->_validator->validate(array(
            'field' => 'Title'
            ,'errorMessage' => 'A title is required'
            ,'required' => false
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