<?php

namespace Emergence\ActiveRecord\Fields;

use Emergence\Database\SqlConnectionInterface;

class Timestamp extends AbstractField implements SqlFieldInterface
{
    public static function getAliases()
    {
        return ['timestamp'];
    }

    public static function unpack($packed, array &$options)
    {
        return is_string($packed) ? strtotime($packed) : $packed;
    }

    public static function getSqlDefinition(array &$options, SqlConnectionInterface $connection)
    {
        return 'TIMESTAMP';
    }

    public static function sqlEncode($value, array &$options, SqlConnectionInterface $connection)
    {
        return sprintf('UNIX_TIMESTAMP(%u)', $value);
    }

    public static function sqlDecode($encoded, array &$options, SqlConnectionInterface $connection)
    {
        return static::unpack($encoded, $options);
    }
}
