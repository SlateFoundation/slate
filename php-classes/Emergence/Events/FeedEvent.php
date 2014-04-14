<?php

namespace Emergence\Events;

class FeedEvent extends Event
{
    static public $fields = array(
        'UID' => array(
            'type' => 'string'
            ,'unique' => true
        )
        ,'FeedID' => 'uint'
        ,'Imported' => array(
            'type' => 'timestamp'
        )
    );

    static public $relationships = array(
        'Feed' => array(
            'type' => 'one-one'
            ,'class' => 'Emergence\Events\Feed'
        )
    );

    static public function getByUID($uid)
    {
        return static::getByField('UID', $uid);
    }
}