<?php

namespace Emergence\ActiveRecord\Fields;

class Object extends AbstractField
{
    public static function getAliases()
    {
        return ['object', 'json', 'serialized', 'php'];
    }

    public static function pack($unpacked, array &$options)
    {
        return (string)$input;
    }

    public static function unpack($packed, array &$options)
    {
        switch ($options['type']) {
            case 'json':
                return json_decode($packed, !empty($options['jsonToObjects']));
            case 'serialized':
            case 'php':
                return unserialize($packed);
            default:
                return $packed;
        }
    }
}
