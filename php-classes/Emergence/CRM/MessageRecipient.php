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
    public static $subClasses = array(__CLASS__);

    public static $fields = array(
        'ContextClass'
        ,'ContextID' => 'uint'
        ,'MessageID' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )
        ,'PersonID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        )
        ,'EmailContactID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        )
        ,'Status' => array(
            'type' => 'enum'
            ,'values' => array('Pending','Sent','Bounced')
            ,'default' => 'Pending'
        )
        ,'Source' => array(
            'type' => 'enum'
            ,'values' => array('System','Direct','Email','Import')
            ,'default' => 'Direct'
        )
    );


    public static $relationships = array(
        'Context' => array(
            'type' => 'context-parent'
        )
        ,'Person' => array(
            'type' => 'one-one'
            ,'class' => 'Emergence\People\Person'
        )
        ,'Message' => array(
            'type' => 'one-one'
            ,'class' => 'Emergence\CRM\Message'
        )
        ,'EmailContact' => array(
            'type' => 'one-one'
            ,'class' => 'Emergence\People\ContactPoints\Email'
        )
    );

    public static $dynamicFields = array(
        'Context',
        'Person',
        'Message',
        'EmailContact'
    );

    public static $indexes = array(
        'MessageRecipient' => array(
            'fields' => array('MessageID','PersonID')
            ,'unique' => true
        )
    );

}