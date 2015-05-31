<?php

namespace Slate\Standards;

use HandleBehavior;

class Worksheet extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'standards_worksheets';
    public static $singularNoun = 'standards worksheet';
    public static $pluralNoun = 'standards worksheets';

    public static $fields = [
        'Title',
        'Handle' => [
            'unique' => true
        ],
        'Status' => [
            'type' => 'enum',
            'values' => ['Live','Hidden','Deleted'],
            'default' => 'Live'
        ],
        'Description' => [
            'notnull' => false
        ]
    ];

    public static $relationships = [
        'Prompts' => [
            'type' => 'many-many',
            'class' => Prompt::class,
            'linkClass' => WorksheetPrompt::class
        ]
    ];

    public static $validators = [
        'Title' => [
            'errorMessage' => 'A title is required'
        ]
    ];

    public static $dynamicFields = [
        'Prompts',
        'TotalPrompts' => [
            'method' => [__CLASS__, 'getTotalPrompts']    
        ]
    ];

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        // implement handles
        HandleBehavior::onValidate($this, $this->_validator);                

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
    {
        // implement handles
        HandleBehavior::onSave($this);                

        // call parent
        parent::save($deep);
    }

    public static function getTotalPrompts(Worksheet $Worksheet)
    {
        return (int)\DB::oneValue(
            'SELECT COUNT(*) FROM `%s` WHERE WorksheetID = %u',
            [
                WorksheetPrompt::$tableName,
                $Worksheet->ID
            ]
        );
    }
}