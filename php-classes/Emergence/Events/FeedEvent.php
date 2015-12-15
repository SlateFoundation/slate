<?php

namespace Emergence\Events;

class FeedEvent extends Event
{
    public static $fields = [
        'UID' => [
            'type' => 'string'
            ,'unique' => true
        ]
        ,'FeedID' => 'uint'
        ,'Imported' => [
            'type' => 'timestamp'
        ]
    ];

    public static $relationships = [
        'Feed' => [
            'type' => 'one-one'
            ,'class' => 'Emergence\Events\Feed'
        ]
    ];

    public static function getByUID($uid)
    {
        return static::getByField('UID', $uid);
    }
}