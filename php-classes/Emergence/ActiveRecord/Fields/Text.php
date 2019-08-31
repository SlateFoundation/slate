<?php

namespace Emergence\ActiveRecord\Fields;

class Text extends AbstractField
{
    public static function getAliases()
    {
        return ['clob', 'text', 'tinytext', 'mediumtext', 'longtext'];
    }
}
