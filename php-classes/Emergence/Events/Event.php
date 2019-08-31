<?php

namespace Emergence\Events;

use HandleBehavior;

class Event extends \ActiveRecord
{
    // support subclassing
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];
    public static $collectionRoute = '/events';

    // ActiveRecord configuration
    public static $tableName = 'events';
    public static $singularNoun = 'event';
    public static $pluralNoun = 'events';

    public static $fields = [
        'Handle' => [
            'unique' => true
        ]
        ,'Title'
        ,'Status' => [
            'type' => 'enum'
            ,'values' => ['Hidden','Published', 'Deleted']
            ,'default' => 'Published'
        ]
        ,'StartTime' => [
            'type' => 'timestamp'
            ,'default' => null
        ]
        ,'EndTime' => [
            'type' => 'timestamp'
            ,'default' => null
        ]
        ,'Location' => [
            'type' => 'string'
            ,'notnull' => false
        ]
        ,'Description' => [
            'type' => 'clob'
            ,'notnull' => false
        ]
    ];

    public static $relationships = [
        'Comments' => [
            'type' => 'context-children'
            ,'class' => 'Comment'
            ,'order' => ['ID' => 'DESC']
        ]
    ];

    public static $searchConditions = [
        'Title' => [
            'qualifiers' => ['any', 'title']
            ,'points' => 3
            ,'sql' => 'Title Like "%%%s%%"'
        ]
        ,'Handle' => [
            'qualifiers' => ['any', 'handle']
            ,'points' => 3
            ,'sql' => 'Handle Like "%%%s%%"'
        ]
        ,'Description' => [
            'qualifiers' => ['any', 'description']
            ,'points' => 1
            ,'sql' => 'Description Like "%%%s%%"'
        ]
        ,'Location' => [
            'qualifiers' => ['any', 'location']
            ,'points' => 2
            ,'sql' => 'Location Like "%%%s%%"'
        ]
    ];


    public static function getUpcoming($options = [], $conditions = [])
    {
        $conditions[] = 'EndTime >= CURRENT_TIMESTAMP';
        $conditions['Status'] = 'Published';

        $options = array_merge([
            'limit' => is_numeric($options) ? $options : 10
            ,'order' => 'StartTime'
        ], is_array($options) ? $options : []);

        return static::getAllByWhere($conditions, $options);
    }

    public static function groupEventsByDate($events)
    {
        $dateFormat = 'Y-m-d';
        $timeFormat = 'Y-m-d H:i:s';
        $dates = [];
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

                $dates[date($dateFormat, $startTime)][] = [
                    'start' => $startTime
                    ,'end' => $endTime
                    ,'Event' => &$Event
                ];
            }
        }

        return $dates;
    }

    public static function getUntil($when, $options = [], $conditions = [])
    {
        $conditions[] = 'EndTime >= CURRENT_TIMESTAMP';
        $conditions[] = 'StartTime <= FROM_UNIXTIME('.strtotime($when).')';
        $conditions['Status'] = 'Published';

        $options = array_merge([
            'order' => 'StartTime'
        ], is_array($options) ? $options : []);

        return static::getAllByWhere($conditions, $options);
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        $this->_validator->validate([
            'field' => 'Title'
            ,'errorMessage' => 'Please enter the title of the event'
        ]);

        $this->_validator->validate([
            'field' => 'StartTime'
            ,'validator' => 'datetime'
            ,'errorMessage' => 'Please provide the start time for the event'
        ]);

        $this->_validator->validate([
            'field' => 'Description'
            ,'validator' => 'string_multiline'
            ,'required' => false
            ,'errorMessage' => 'Please provide a description for the event'
        ]);

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