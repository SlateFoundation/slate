<?php

namespace Slate\Standards;

class WorksheetPrompt extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'standards_worksheet_prompts';

    public static $fields = [
        'WorksheetID' => 'uint',
        'PromptID' => 'uint',
        'Position' => [
            'type' => 'uint',
            'default' => 0
        ]
    ];

    public static $relationships = [
        'Worksheet' => [
            'type' => 'one-one',
            'class' => Worksheet::class
        ],
        'Prompt' => [
            'type' => 'one-one',
            'class' => Prompt::class
        ]
    ];

    public static $validators = [
        'Worksheet' => 'require-relationship',
        'Prompt' => 'require-relationship'
    ];

    public static $indexes = [
        'WorksheetPrompt' => [
            'fields' => ['WorksheetID', 'PromptID'],
            'unique' => true
        ]
    ];
}