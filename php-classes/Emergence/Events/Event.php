<?php

namespace Emergence\Events;

use HandleBehavior;

class Event extends \ActiveRecord
{
    // support subclassing
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array(__CLASS__);
    static public $collectionRoute = '/events';

    // ActiveRecord configuration
    static public $tableName = 'events';
    static public $singularNoun = 'event';
    static public $pluralNoun = 'events';

    static public $fields = array(
        'Handle' => array(
            'unique' => true
        )
        ,'Title'
        ,'Status' => array(
            'type' => 'enum'
            ,'values' => array('Hidden','Published', 'Deleted')
            ,'default' => 'Published'
        )
        ,'StartTime' => array(
            'type' => 'timestamp'
        )
        ,'EndTime' => array(
            'type' => 'timestamp'
            ,'notnull' => false
        )
        ,'Location' => array(
            'type' => 'string'
            ,'notnull' => false
        )
        ,'Description' => array(
            'type' => 'clob'
            ,'notnull' => false
        )
    );

    static public $relationships = array(
        'Comments' => array(
            'type' => 'context-children'
            ,'class' => 'Comment'
            ,'order' => array('ID' => 'DESC')
        )
    );

    static public $searchConditions = array(
        'Title' => array(
            'qualifiers' => array('any', 'title')
            ,'points' => 3
            ,'sql' => 'Title Like "%%%s%%"'
        )
        ,'Handle' => array(
            'qualifiers' => array('any', 'handle')
            ,'points' => 3
            ,'sql' => 'Handle Like "%%%s%%"'
        )
        ,'Description' => array(
            'qualifiers' => array('any', 'description')
            ,'points' => 1
            ,'sql' => 'Description Like "%%%s%%"'
        )
        ,'Location' => array(
            'qualifiers' => array('any', 'location')
            ,'points' => 2
            ,'sql' => 'Location Like "%%%s%%"'
        )
    );


    static public function getUpcoming($options = array(), $conditions = array())
    {
        $conditions[] = 'StartTime >= CURRENT_TIMESTAMP';
        $conditions['Status'] = 'Published';

        $options = array_merge(array(
            'limit' => is_numeric($options) ? $options : 10
            ,'order' => 'StartTime'
        ), is_array($options) ? $options : array());

        return static::getAllByWhere($conditions, $options);
    }

    static public function groupEventsByDate($events)
    {
        $dateFormat = 'Y-m-d';
        $timeFormat = 'Y-m-d H:i:s';
        $dates = array();
        $oneDay = 3600*24;

        foreach ($events AS &$Event) {
            $daysSpanned = ($Event->EndTime - $Event->StartTime) / $oneDay;

            for ($daysWritten = 0; $daysWritten < $daysSpanned; $daysWritten++) {
                if ($daysWritten) {
                    $startTime = strtotime(date($dateFormat, $Event->StartTime + ($daysWritten * $oneDay)));
                } else {
                    $startTime = $Event->StartTime;
                }

                if ($daysWritten == floor($daysSpanned)) {
                    $endTime = $Event->EndTime;
                } else {
                    $endTime = strtotime(date($dateFormat, $startTime + $oneDay));
                }

                $dates[date($dateFormat, $startTime)][] = array(
                    'start' => $startTime
                    ,'end' => $endTime
                    ,'Event' => &$Event
                );
            }
        }

        return $dates;
    }

    static public function getUntil($when, $options = array(), $conditions = array())
    {
        $conditions[] = 'EndTime >= CURRENT_TIMESTAMP';
        $conditions[] = 'StartTime <= FROM_UNIXTIME('.strtotime($when).')';
        $conditions['Status'] = 'Published';

        $options = array_merge(array(
            'order' => 'StartTime'
        ), is_array($options) ? $options : array());

        return static::getAllByWhere($conditions, $options);
    }

    static public function getByHandle($showHandle)
    {
        return static::getByField('Handle', $showHandle, true);
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        $this->_validator->validate(array(
            'field' => 'Title'
            ,'errorMessage' => 'Please enter the title of the event'
        ));

        $this->_validator->validate(array(
            'field' => 'StartTime'
            ,'validator' => 'datetime'
            ,'errorMessage' => 'Please provide the start time for the event'
        ));

        $this->_validator->validate(array(
            'field' => 'Description'
            ,'validator' => 'string_multiline'
            ,'required' => false
            ,'errorMessage' => 'Please provide a description for the event'
        ));

        HandleBehavior::onValidate($this, $this->_validator);

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
    {
        HandleBehavior::onSave($this);

        // call parent
        parent::save();
    }

    public function getValue($name)
    {
        switch ($name) {
            case 'isAllDay':
                $start = getdate($this->StartTime);
                $end = getdate($this->EndTime);

                return !$start['hours'] && !$start['minutes'] && !$start['seconds'] && !$end['hours'] && !$end['minutes'] && !$end['seconds'];
            case 'isMultiDay':
                return $this->EndTime - $this->StartTime > 86400;
            default:
                return parent::getValue($name);
        }
    }
}