<?php

namespace Emergence\CRM;

class MessageRecipient extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'message_recipients';
    public static $singularNoun = 'message recipient';
    public static $pluralNoun = 'message recipients';

    public static $fields = [
        'MessageID' => 'uint',
        'PersonID' => [
            'type' => 'uint',
            'index' => true
        ],
        'EmailContactID' => [
            'type' => 'uint',
            'notnull' => false
        ],
        'Status' => [
            'type' => 'enum',
            'values' => ['pending', 'sent', 'bounced'],
            'default' => 'pending'
        ],
        'Source' => [
            'type' => 'enum',
            'values' => ['system', 'direct', 'email', 'import'],
            'default' => 'direct'
        ]
    ];

    public static $relationships = [
        'Context' => [
            'type' => 'context-parent'
        ],
        'Person' => [
            'type' => 'one-one',
            'class' => \Emergence\People\Person::class
        ],
        'Message' => [
            'type' => 'one-one',
            'class' => \Message::class
        ],
        'EmailContact' => [
            'type' => 'one-one',
            'class' => \Emergence\People\ContactPoints\Email::class
        ]
    ];

    public static $dynamicFields = [
        'Context',
        'Person',
        'Message',
        'EmailContact'
    ];

    public static $indexes = [
        'MessageRecipient' => [
            'fields' => ['MessageID', 'PersonID'],
            'unique' => true
        ]
    ];
}