<?php

namespace Emergence\CRM;

class GlobalRecipient extends \ActiveRecord
{
    public static $tableName = 'global_message_recipients';
    public static $singularNoun = 'global message recipient';
    public static $pluralNoun = 'global message recipients';

    public static $fields = [
        'PersonID' => 'uint',
        'Title'
    ];

    public static $validators = [
        'PersonID' => [
            'validator' => 'number',
            'min' => 1,
            'required' => true,
            'errorMessage' => 'You must specify a person'
        ]
    ];

    public static $relationships = [
        'Person' => [
            'type' => 'one-one',
            'class' => \Emergence\People\Person::class
        ]
    ];

    public static $dynamicFields = [
        'Person'
    ];
}