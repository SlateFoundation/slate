<?php

namespace Emergence\Comments;

use ActiveRecord;

class CommentsRequestHandler extends \RecordsRequestHandler
{
    public static $sendEmailNotifications = false;

    // RecordsRequestHandler configuration
    public static $recordClass = 'Emergence\Comments\Comment';
    public static $accountLevelRead = false;
    public static $accountLevelBrowse = false;
    public static $accountLevelWrite = 'User';
    public static $browseOrder = array('ID' => 'DESC');
    public static $userResponseModes = array(
        'application/json' => 'json'
        ,'text/csv' => 'csv'
        ,'application/rss+xml' => 'rss'
    );

    public static function respond($responseID, $responseData = array(), $responseMode = false)
    {
        if (static::$responseMode == 'rss') {
            static::$responseMode = 'xml';
            return parent::respond('rss', $responseData);
        } else {
            return parent::respond($responseID, $responseData);
        }
    }

    public static function checkWriteAccess(ActiveRecord $Comment = null, $suppressLogin = false)
    {
        // only allow creating, editing your own, and staff editing
        if ($Comment && !$Comment->isPhantom && ($Comment->CreatorID != $GLOBALS['Session']->PersonID) && !$GLOBALS['Session']->hasAccountLevel('Staff')) {
            return false;
        }

        if ((!$Comment || $Comment->isPhantom) && !$GLOBALS['Session']->PersonID) {
            return false;
        }

        return true;
    }
}