<?php

namespace Slate\SBG;

class WorksheetPrompt extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'sbg_worksheet_prompts';
    public static $singularNoun = 'standards worksheet prompt';
    public static $pluralNoun = 'standards worksheet prompts';
    public static $collectionRoute = '/sbg/worksheet-prompts';
    public static $updateOnDuplicateKey = true;

    public static $fields = [
        'WorksheetID' => 'uint',
        'Position' => [
            'type' => 'uint',
            'default' => 1
        ],
        'Prompt' => 'string',
        'Status' => [
            'type' => 'enum',
            'values' => ['published', 'deleted'],
            'default' => 'published'
        ]
    ];

    public static $relationships = [
        'Worksheet' => [
            'type' => 'one-one',
            'class' => Worksheet::class
        ]
    ];

    public static $validators = [
        'Worksheet' => 'require-relationship',
        'Prompt'
    ];

    public static $indexes = [
        'WorksheetPrompt' => [
            'fields' => ['WorksheetID', 'Prompt'],
            'unique' => true
        ]
    ];

    public function destroy()
    {
        $this->Status = 'deleted';
        $this->save();

        return true;
    }

    public static function delete($id)
    {
        $Prompt = static::getbyId($id);

        return $Prompt ? $Prompt->destroy() : false;
    }
}