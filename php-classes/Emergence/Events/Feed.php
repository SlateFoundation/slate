<?php

namespace Emergence\Events;

class Feed extends \ActiveRecord
{
    // ActiveRecord configuration
    static public $tableName = 'feeds';
    static public $singularNoun = 'feed';
    static public $pluralNoun = 'feeds';

    static public $fields = array(
        'Title'
        ,'Link'
        ,'MinimumDate' => array(
            'type' => 'timestamp'
            ,'notnull' => false
        )
    );
}