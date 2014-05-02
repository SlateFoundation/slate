<?php

namespace Emergence\CMS;

class DraftsRequestHandler extends \RequestHandler
{
    public static function handleRequest()
    {
        $GLOBALS['Session']->requireAuthentication();

        if (static::peekPath() == 'json') {
            static::$responseMode = static::shiftPath();
        }

        return static::respond('drafts', array(
            'success' => true
            ,'data' => AbstractContent::getAllByWhere(array(
                'AuthorID' => $GLOBALS['Session']->PersonID
                ,'Status = "Draft" OR Published > CURRENT_TIMESTAMP'
            ))
        ));
    }
}