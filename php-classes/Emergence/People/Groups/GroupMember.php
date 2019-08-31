<?php

namespace Emergence\People\Groups;

use ActiveRecord;

class GroupMember extends ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'group_members';

    public static $fields = array(
        'GroupID' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )
        ,'PersonID' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )
        ,'Role' => array(
            'type' => 'enum'
            ,'values' => array('Member', 'Administrator', 'Owner', 'Founder')
        )
        ,'Rank' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        )
        ,'Title' => array(
            'type' => 'string'
            ,'notnull' => false
        )
        ,'Joined' => array(
            'type' => 'timestamp'
            ,'default' => null
        )
        ,'Expires' => array(
            'type' => 'timestamp'
            ,'notnull' => false
        )
    );

    public static $relationships = array(
        'Person' => array(
            'type' => 'one-one'
            ,'class' => 'Person'
        )
        ,'Group' => array(
            'type' => 'one-one'
            ,'class' => 'Emergence\People\Groups\Group'
        )
    );

    public static $indexes = array(
        'GroupPerson' => array(
            'fields' => array('GroupID', 'PersonID')
            ,'unique' => true
        )
    );

    public static $dynamicFields = array(
        'Group'
    );

    public function save($deep = true)
    {
        if (!$this->Joined) {
            $this->Joined = time();
        }

        // call parent
        parent::save($deep);
    }
}