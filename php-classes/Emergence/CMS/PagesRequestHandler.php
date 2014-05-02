<?php

namespace Emergence\CMS;

class PagesRequestHandler extends AbstractRequestHandler
{
    // RecordsRequestHandler config
    public static $recordClass = 'Emergence\CMS\Page';
    public static $browseConditions = array(
        'Class' => 'Emergence\CMS\Page'
    );

    protected static function throwRecordNotFoundError($handle, $message = 'Record not found')
    {
        return static::respond('pageNotFound', array(
            'success' => false
            ,'pageHandle' => $handle
        ));
    }
}