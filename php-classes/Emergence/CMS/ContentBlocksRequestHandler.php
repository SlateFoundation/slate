<?php

namespace Emergence\CMS;

class ContentBlocksRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = 'Emergence\CMS\ContentBlock';

    public static $accountLevelRead = 'Staff';
    public static $accountLevelComment = 'Staff';
    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelAPI = 'Staff';
}