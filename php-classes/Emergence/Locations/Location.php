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
    public static $subClasses = array(__CLASS__);

    public static $fields = array(
        'Title' => array(
            'fulltext' => true
        )
        ,'Handle' => array(
            'unique' => true
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
        ,'ParentID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        )
        ,'Left' => array(
            'type' => 'int'
            ,'notnull' => false
            ,'unique' => true
        )
        ,'Right' => array(
            'type' => 'int'
            ,'notnull' => false
        )
    );

    public static $relationships = array(
        'Parent' => array(
            'type' => 'one-one'
            ,'class' => 'Emergence\\Locations\\Location'
        )
    );

    public static $dynamicFields = array(
        'Parent'
    );


    public static function getOrCreateByHandle($handle, $title = null)
    {
        if ($Location = static::getByHandle($handle)) {
            return $Location;
        } else {
            return static::create(array(
                'Title' => $title ? $title : $handle
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
        ));

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

    public function save($deep = true, $createRevision = true)
    {
        // implement handles
        HandleBehavior::onSave($this);

        NestingBehavior::onSave($this);

        // call parent
        parent::save($deep, $createRevision);
    }
    
    public function clean() {
        $this->_isDirty = false;
    }
}