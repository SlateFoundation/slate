<?php

namespace Emergence\CMS;

use ActiveRecord;
use CommentsRequestHandler;

class BlogRequestHandler extends AbstractRequestHandler
{
    // RecordsRequestHandler config
    public static $recordClass = 'Emergence\CMS\BlogPost';
    public static $accountLevelAPI = false;
    public static $accountLevelWrite = 'User';
    public static $browseConditions = array(
        'Class' => 'Emergence\CMS\BlogPost'
        ,'Status' => 'Published'
    );

    public static $browseLimitDefault = 25;


    public static function handleRecordRequest(ActiveRecord $BlogPost, $action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case 'comment':
                return CommentsRequestHandler::handleCreateRequest($BlogPost);
            default:
                return parent::handleRecordRequest($BlogPost, $action);
        }
    }

    public static function handleRequest()
    {
        if (!$GLOBALS['Session']->Person) {
            static::$browseConditions['Visibility'] = 'Public';
        }

        if (static::peekPath() == 'rss') {
            static::$responseMode = static::shiftPath();
        }

        if ($_REQUEST['AuthorID']) {
            static::$browseConditions['AuthorID'] = $_REQUEST['AuthorID'];
        }

        parent::handleRequest();
    }

    public static function checkWriteAccess(ActiveRecord $BlogPost, $suppressLogin = false)
    {
        // only allow creating, editing your own, and staff editing
        if (!$BlogPost->isPhantom && ($BlogPost->AuthorID != $GLOBALS['Session']->PersonID) && !$GLOBALS['Session']->hasAccountLevel('Staff')) {
            return false;
        }

        if ($BlogPost->isPhantom && !$GLOBALS['Session']->PersonID) {
            return false;
        }

        return true;
    }

    public static function respond($responseID, $responseData = Array(), $responseMode = false)
    {
        if (static::$responseMode == 'rss') {
            static::$responseMode = 'xml';

            if (static::$browseConditions['AuthorID']) {
                $User = User::getByID(static::$browseConditions['AuthorID']);
                $responseData['Author'] = $User;
                $responseData['Link'] = 'http://'.$_SERVER['HTTP_HOST'].$User->getURL();
            }

            return parent::respond('rss', $responseData);
        } else {
            return parent::respond($responseID, $responseData);
        }
    }

    public static function checkReadAccess(ActiveRecord $BlogPost, $suppressLogin = false)
    {
        if ($BlogPost->Visibility == 'Private' && !$GLOBALS['Session']->Person) {
            return false;
        }

        return parent::checkReadAccess($BlogPost);
    }
}