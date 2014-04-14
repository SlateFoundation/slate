<?php

namespace Emergence\Locations;

use HandleBehavior, NestingBehavior;

class Location extends \VersionedRecord
{
    // VersionedRecord configuration
    static public $historyTable = 'history_locations';

    // ActiveRecord configuration
    static public $tableName = 'locations';
    static public $singularNoun = 'location';
    static public $pluralNoun = 'locations';

    // required for shared-table subclassing support
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array(__CLASS__);

    static public $fields = array(
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
    		'type' => 'uint'
			,'notnull' => false
            ,'unique' => true
		)
        ,'Right' => array(
    		'type' => 'uint'
			,'notnull' => false
		)
    );

    static public $relationships = array(
        'Parent' => array(
            'type' => 'one-one'
            ,'class' => 'Emergence\\Locations\\Location'
        )
    );
    
    static public $dynamicFields = array(
        'Parent'
    );


    static public function getByHandle($handle)
    {
        return static::getByField('Handle', $handle, true);
    }

    static public function getOrCreateByHandle($handle, $title = null)
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
}