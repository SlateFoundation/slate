<?php

namespace Emergence\ActiveRecord\Fields;

interface FieldInterface
{
    public static function getAliases();
    public static function initOptions(array &$options);
    public static function pack($unpacked, array &$options);
    public static function unpack($packed, array &$options);
}
