<?php

namespace Emergence\ActiveRecord\Fields;

use Emergence\Database\SqlConnectionInterface;

interface SqlFieldInterface
{
    public static function getSqlDefinition(array &$options, SqlConnectionInterface $connection);
    public static function sqlEncode($input, array &$options, SqlConnectionInterface $connection);
    public static function sqlDecode($string, array &$options, SqlConnectionInterface $connection);
}
