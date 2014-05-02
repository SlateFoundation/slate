<?php

namespace Emergence\Events;

class FeedEvent extends Event
{
    public static $fields = array(
        'UID' => array(
            'type' => 'string'
            ,'unique' => true
        )
        ,'FeedID' => 'uint'
        ,'Imported' => array(
            'type' => 'timestamp'
        )
    );

    public static $relationships = array(
        'Feed' => array(
            'type' => 'one-one'
            ,'class' => 'Emergence\Events\Feed'
        )
    );

    public static function getByUID($uid)
    {
        return static::getByField('UID', $uid);
    }
}