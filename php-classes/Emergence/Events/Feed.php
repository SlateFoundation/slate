<?php

namespace Emergence\Events;

class Feed extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'feeds';
    public static $singularNoun = 'feed';
    public static $pluralNoun = 'feeds';
    public static $collectionRoute = '/feeds';

    public static $fields = [
        'Title'
        ,'Link'
        ,'MinimumDate' => [
            'type' => 'timestamp'
            ,'notnull' => false
        ]
    ];
}