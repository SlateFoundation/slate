<?php

namespace Slate\SBG;

use HandleBehavior;

class Worksheet extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'sbg_worksheets';
    public static $singularNoun = 'standards worksheet';
    public static $pluralNoun = 'standards worksheets';
    public static $collectionRoute = '/sbg/worksheets';

    public static $fields = [
        'Title',
        'Handle' => [
            'unique' => true
        ],
        'Status' => [
            'type' => 'enum',
            'values' => ['published', 'deleted'],
            'default' => 'published'
        ],
        'Description' => [
            'notnull' => false
        ]
    ];

    public static $relationships = [
        'Prompts' => [
            'type' => 'one-many',
            'class' => WorksheetPrompt::class,
            'order' => 'Position'
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