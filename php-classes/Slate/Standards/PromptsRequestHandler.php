<?php

namespace Slate\Standards;

class PromptsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = Prompt::class;
    public static $accountLevelBrowse = 'User';

    // TODO: this all looks busted and a lot of it could probably be done via config or tighter overrides

    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        if (!empty($_REQUEST['q'])) {
            return static::handleQueryRequest($_REQUEST['q'], $conditoins, $options, $responseID, $responseData);
        }

        if (!empty($_REQUEST['WorksheetID']) && is_numeric($_REQUEST['WorksheetID'])) {
            return static::respond('worksheetPrompts', [
                'success' => true,
                'data' => Prompt::getAllByQuery(
                    'SELECT Prompt.* FROM `%s` Link INNER JOIN `%s` Prompt ON (Prompt.ID = Link.PromptID] WHERE Link.WorksheetID = %u ORDER BY Link.Position, Prompt.Prompt',
                    [
                        WorksheetPrompt::$tableName,
                        Prompt::$tableName,
                        $_REQUEST['WorksheetID']
                    ]
                )
            ]);
        } else {
            return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
        }
    }

    public static function handleQueryRequest($query, $conditions = [], $options = [], $responseID = null, $responseData = [], $mode = 'AND')
    {
        return static::respond('prompts', [
            'success' => true,
            'query' => $query,
            'data' => Prompt::getAllByWhere('Prompt LIKE "%'.\DB::escape($query).'%"')
        ]);
    }

    static protected function onBeforeRecordValidated(\ActiveRecord $Prompt, $data)
    {
        $conditions = ['Prompt' => $Prompt->Prompt];
        //MICS::dump([$Prompt,$data], 'saved',true);
        if (!$Prompt->isPhantom) {
            $conditions[] = 'ID != ' . $Prompt->ID;
        }

        if ($ExistingPrompt = Prompt::getByWhere($conditions)) {
            $Prompt = $ExistingPrompt;
        }
    }


    // TODO: this should probably be done via a relationship in onBeforeRecordValidated and enforced in the validator
    static protected function onRecordSaved(\ActiveRecord $Prompt, $data)
    {
        if (!empty($data['WorksheetID']) && is_numeric($data['WorksheetID'])) {
            try {
                $Link = WorksheetPrompt::create([
                    'PromptID' => $Prompt->ID,
                    'WorksheetID' => $data['WorksheetID']
                ], true);
            } catch (DuplicateKeyException $e) {}
        }
    }

}