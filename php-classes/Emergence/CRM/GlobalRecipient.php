<?php

namespace Emergence\CRM;

class GlobalRecipient extends \ActiveRecord
{
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);

    public static $tableName = 'global_message_recipients';
    public static $singularNoun = 'global_message_recipient';
    public static $pluralNoun = 'global_message_recipients';

    public static $fields = array(
        'PersonID' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )
        ,'Title'
    );

    public static $validators = array(
        'PersonID' => array(
            'validator' => 'number',
            'min' => 1,
            'required' => true,
            'errorMessage' => 'You must specify a person'
        )
    );

    public static $relationships = array(
        'Person' => array(
            'type' => 'one-one'
            ,'class' => 'Person'
        )
    );

    public static $dynamicFields = array(
        'Person'
    );
}