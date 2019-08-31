<?php

namespace Emergence\ActiveRecord\Fields;

class Integer extends AbstractField
{
    public static function getAliases()
    {
        return ['integer', 'int', 'bigint', 'smallint', 'mediumint', 'tinyint', 'uint'];
    }

    public static function initOptions(array &$options)
    {
        if ($options['type'] == 'uint') {
            $options['type'] = 'int';
            $options['unsigned'] = true;
        }
    }

    public static function unpack($packed, array &$options)
    {
        return isset($packed) ? (int)$packed : null;
    }
}
