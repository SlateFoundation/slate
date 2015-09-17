<?php

namespace Emergence\CRM;

class MessageRecipient extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'message_recipients';
    public static $singularNoun = 'message recipient';
    public static $pluralNoun = 'message recipients';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    public static $fields = [
        'ContextClass'
        ,'ContextID' => 'uint'
        ,'MessageID' => [
            'type' => 'integer'
            ,'unsigned' => true
        ]
        ,'PersonID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        ]
        ,'EmailContactID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        ]
        ,'Status' => [
            'type' => 'enum'
            ,'values' => ['Pending','Sent','Bounced']
            ,'default' => 'Pending'
        ]
        ,'Source' => [
            'type' => 'enum'
            ,'values' => ['System','Direct','Email','Import']
            ,'default' => 'Direct'
        ]
    ];


    public static $relationships = [
        'Context' => [
            'type' => 'context-parent'
        ]
        ,'Person' => [
            'type' => 'one-one'
            ,'class' => 'Emergence\People\Person'
        ]
        ,'Message' => [
            'type' => 'one-one'
            ,'class' => 'Emergence\CRM\Message'
        ]
        ,'EmailContact' => [
            'type' => 'one-one'
            ,'class' => 'Emergence\People\ContactPoints\Email'
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
            'fields' => ['MessageID','PersonID']
            ,'unique' => true
        ]
    ];
}