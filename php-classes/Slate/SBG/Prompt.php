<?php

namespace Slate\SBG;

class Prompt extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'sbg_prompts';
    public static $singularNoun = 'standards prompt';
    public static $pluralNoun = 'standards prompts';

    public static $fields = [
        'Prompt' => [
            'unique' => true
        ],
        'Status' => [
            'type' => 'enum',
            'values' => ['Live','Hidden','Deleted'],
            'default' => 'Live'
        ]
    ];

    public static $validators = [
        'Prompt' => [
            'validator' => [__CLASS__, 'validatePrompt']
        ]
    ];

    public static function validatePrompt(\RecordValidator $validator, Prompt $Prompt)
    {
        if (empty($Prompt->Prompt)) {
            $validator->addError('Prompt', 'A prompt is required');
            return;
        }

        $duplicateConditions = [
            'Prompt' => $Prompt->Prompt
        ];

        if (!$Prompt->isPhantom) {
            $duplicateConditions[] = sprintf('ID != %u', $Prompt->ID);
        }

        if ($DuplicatePrompt = static::getByWhere($duplicateConditions)) {
            $validator->addError('Prompt', sprintf('This prompt has the same text as existing prompt #%u', $DuplicatePrompt->ID));
        }
    }
}