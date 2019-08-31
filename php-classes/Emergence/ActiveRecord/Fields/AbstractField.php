<?php

namespace Emergence\ActiveRecord\Fields;

abstract class AbstractField implements FieldInterface
{
    public static function initOptions(array &$options)
    {
    }

    public static function pack($unpacked, array &$options)
    {
        return $unpacked;
    }

    public static function unpack($packed, array &$options)
    {
        return $packed;
    }
}
