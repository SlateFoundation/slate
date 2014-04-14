<?php

namespace Emergence\CMS;

class PagesRequestHandler extends AbstractRequestHandler
{
    // RecordsRequestHandler config
    static public $recordClass = 'Emergence\CMS\Page';
    static public $browseConditions = array(
        'Class' => 'Emergence\CMS\Page'
    );

    static protected function throwRecordNotFoundError($handle, $message = 'Record not found')
    {
        return static::respond('pageNotFound', array(
            'success' => false
            ,'pageHandle' => $handle
        ));
    }
}