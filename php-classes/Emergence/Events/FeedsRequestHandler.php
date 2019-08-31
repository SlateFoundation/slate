<?php

namespace Emergence\Events;

class FeedsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = '\Emergence\Events\Feed';

    public static function handleRecordsRequest($action = false)
    {
        switch ($action = $action ? $action : static::shiftPath()) {
            case 'test':
                return static::handleTestRequest();
            default:
                return parent::handleRecordsRequest($action);
        }
    }

    public static function handleTestRequest()
    {
        if (empty($_REQUEST['url'])) {
            return static::throwError('You didn\'t supply a url.');
        }

        $feed = new \intouch\ical\iCal($_REQUEST['url']);
        $feedTitle = $feed->getCalendarInfo()->getTitle();

        return static::respond('linkTest', [
            'success' => $feedTitle ? true : false
            ,'data' => $feedTitle
        ]);
    }
}