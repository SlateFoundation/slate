<?php

namespace Emergence\People;

use HandleBehavior;

class Invitation extends \ActiveRecord
{
    public static $tableName = 'invitations';
    public static $singularNoun = 'invitation';
    public static $pluralNoun = 'invitations';

    public static $fields = [
        'RecipientID' => [
            'type' => 'uint',
            'index' => true
        ],
        'Handle' => [
            'unique' => true
        ],
        'Status' => [
            'type' => 'enum',
            'values' => ['Pending', 'Used', 'Revoked'],
            'default' => 'Pending'
        ],
        'Expires' => [
            'type' => 'timestamp',
            'notnull' => false
        ],
        'Used' => [
            'type' => 'timestamp',
            'notnull' => false
        ]
    ];

    public static $relationships = [
        'Recipient' => [
            'type' => 'one-one',
            'class' => Person::class
        ]
    ];

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