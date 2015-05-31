<?php

namespace Slate\Standards;

class WorksheetsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = Worksheet::class;
    public static $accountLevelBrowse = 'User';
    public static $browseOrder = 'Title';
    public static $browseConditions = ['Status' => 'Live'];
}