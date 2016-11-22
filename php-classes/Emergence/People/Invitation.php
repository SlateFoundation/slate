<?php

namespace Emergence\People;

use HandleBehavior;

class Invitation extends \ActiveRecord
{
    public static $tableName = 'invitations';
    public static $singularNoun = 'invitation';
    public static $pluralNoun = 'invitations';

    public static $fields = array(
        'RecipientID' => array(
            'type' => 'uint',
            'index' => true
        ),
        'Handle' => array(
            'unique' => true
        ),
        'Status' => array(
            'type' => 'enum',
            'values' => array('Pending', 'Used', 'Revoked'),
            'default' => 'Pending'
        ),
        'Expires' => array(
            'type' => 'timestamp',
            'notnull' => false
        ),
        'Used' => array(
            'type' => 'timestamp',
            'notnull' => false
        )
    );

    public static $relationships = array(
        'Recipient' => array(
            'type' => 'one-one'
            ,'class' => Person::class
        )
    );

    public function save($deep = true)
    {
        // set handle
        if (!$this->Handle) {
            $this->Handle = HandleBehavior::generateRandomHandle($this);
        }

        // call parent
        parent::save($deep);
    }
}