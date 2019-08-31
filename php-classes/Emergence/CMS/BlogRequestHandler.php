<?php

namespace Emergence\CMS;

use ActiveRecord;

class BlogRequestHandler extends AbstractRequestHandler
{
    // RecordsRequestHandler config
    public static $recordClass = 'Emergence\CMS\BlogPost';
    public static $accountLevelAPI = false;
    public static $accountLevelWrite = 'User';
    public static $accountLevelWriteAll = 'Staff';
    public static $browseConditions = array(
        'Class' => 'Emergence\CMS\BlogPost'
        ,'Status' => 'Published'
    );
    public static $userResponseModes = array(
        'application/json' => 'json'
        ,'text/csv' => 'csv'
        ,'application/rss+xml' => 'rss'
    );

    public static $browseLimitDefault = 25;

    public static function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
    {
        if (empty($GLOBALS['Session']) || !$GLOBALS['Session']->Person) {
            $conditions['Visibility'] = 'Public';
        }

        if (!empty($_REQUEST['AuthorID'])) {
            $conditions['AuthorID'] = $_REQUEST['AuthorID'];
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }

    public static function checkReadAccess(ActiveRecord $BlogPost = null, $suppressLogin = false)
    {
        if ($BlogPost->Visibility == 'Private' && !$GLOBALS['Session']->Person) {
            return false;
        }

        return parent::checkReadAccess($BlogPost, $suppressLogin);
    }

    public static function checkWriteAccess(ActiveRecord $BlogPost = null, $suppressLogin = false)
    {
        // only allow creating, editing your own, and staff editing
        if (
            $BlogPost &&
            !$BlogPost->isPhantom &&
            $BlogPost->AuthorID != $GLOBALS['Session']->PersonID &&
            !$GLOBALS['Session']->hasAccountLevel(static::$accountLevelWriteAll)
        ) {
            return false;
        }

        return parent::checkWriteAccess($BlogPost, $suppressLogin);
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
}