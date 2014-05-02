<?php

namespace Emergence\CMS;

use ActiveRecord;
use CommentsRequestHandler;

class BlogRequestHandler extends AbstractRequestHandler
{
    // RecordsRequestHandler config
    static public $recordClass = 'Emergence\CMS\BlogPost';
    static public $accountLevelAPI = false;
    static public $accountLevelWrite = 'User';
    static public $browseConditions = array(
        'Class' => 'Emergence\CMS\BlogPost'
        ,'Status' => 'Published'
    );
    
    static public $browseLimitDefault = 25;


    static public function handleRecordRequest(ActiveRecord $BlogPost, $action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case 'comment':
                return CommentsRequestHandler::handleCreateRequest($BlogPost);
            default:
                return parent::handleRecordRequest($BlogPost, $action);
        }
    }   
    
    static public function handleRequest()
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

    static public function checkWriteAccess(ActiveRecord $BlogPost, $suppressLogin = false)
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
    
    static public function respond($responseID, $responseData = Array(), $responseMode = false)
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
    
    static public function checkReadAccess(ActiveRecord $BlogPost, $suppressLogin = false)
    {
        if ($BlogPost->Visibility == 'Private' && !$GLOBALS['Session']->Person) {
            return false;
        }
        
        return parent::checkReadAccess($BlogPost);
    }
}