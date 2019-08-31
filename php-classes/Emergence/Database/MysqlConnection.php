<?php

namespace Emergence\Database;

use PDO;

class MysqlConnection extends AbstractSqlConnection
{
    protected static $defaultInstance;

    public static function createInstance($pdo = null)
    {
        $pdo = $pdo ?: [];

        if (is_array($pdo)) {
            $dsn = 'mysql:charset=utf8;dbname=' . $pdo['database'];

            if (!empty($pdo['socket'])) {
                $dsn .= ';unix_socket=' . $pdo['socket'];
            } else {
                $dsn .= ';host=' . ($pdo['host'] ?: 'localhost');
                $dsn .= ';port=' . ($pdo['port'] ?: 3306);
            }

            $pdo = new PDO($dsn, $pdo['username'], $pdo['password']);
        }

        return parent::createInstance($pdo);
    }

    public function quoteIdentifier($identifier)
    {
        return '`' . str_replace('`', '``', $identifier) . '`';
    }
}