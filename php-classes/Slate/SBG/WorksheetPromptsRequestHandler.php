<?php

namespace Slate\SBG;

class WorksheetPromptsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = WorksheetPrompt::class;
    public static $accountLevelBrowse = 'User';
    public static $browseOrder = 'Position';
    public static $browseConditions = ['Status' => 'published'];

    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        if (!empty($_REQUEST['worksheet']) && ctype_digit($_REQUEST['worksheet'])) {
            $conditions['WorksheetID'] = $_REQUEST['worksheet'];
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }
}