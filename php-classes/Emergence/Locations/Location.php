<?php

namespace Emergence\Locations;

use HandleBehavior, NestingBehavior;

class Location extends \VersionedRecord
{
    // VersionedRecord configuration
    public static $historyTable = 'history_locations';

    // ActiveRecord configuration
    public static $tableName = 'locations';
    public static $singularNoun = 'location';
    public static $pluralNoun = 'locations';
    public static $collectionRoute = '/locations';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    public static $fields = [
        'Title' => [
            'fulltext' => true
        ]
        ,'Handle' => [
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
        ,'ParentID' => [
            'type' => 'uint'
            ,'notnull' => false
        ]
        ,'Left' => [
            'type' => 'uint'
            ,'notnull' => false
            ,'unique' => true
        ]
        ,'Right' => [
            'type' => 'uint'
            ,'notnull' => false
        ]
    ];

    public static $relationships = [
        'Parent' => [
            'type' => 'one-one'
            ,'class' => __CLASS__
        ]
    ];

    public static $dynamicFields = [
        'Parent'
    ];


    public static function getOrCreateByHandle($handle, $title = null)
    {
        $handle = HandleBehavior::transformText($handle);

        if ($Location = static::getByHandle($handle)) {
            return $Location;
        } else {
            return static::create([
                'Title' => $title ? $title : $handle
                ,'Handle' => $handle
            ], true);
        }
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        $this->_validator->validate([
            'field' => 'Title'
            ,'errorMessage' => 'A title is required'
        ]);

        // implement handles
        HandleBehavior::onValidate($this, $this->_validator);

        // save results
        return $this->finishValidation();
    }

    public function destroy()
    {
        parent::destroy();

        NestingBehavior::onDestroy($this);
    }

    public function save($deep = true)
    {
        // implement handles
        HandleBehavior::onSave($this);

        NestingBehavior::onSave($this);

        // call parent
        parent::save($deep);
    }
}