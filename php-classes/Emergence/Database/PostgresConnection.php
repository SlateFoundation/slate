<?php

namespace Emergence\Database;

use PDO;

class PostgresConnection extends AbstractSqlConnection
{
    protected static $defaultInstance;

    public static function createInstance($pdo = null)
    {
        $pdo = $pdo ?: [];

        if (is_array($pdo)) {
            $pdoConfig = $pdo;

            $dsn = 'pgsql:options=\'--client_encoding=UTF8\';dbname=' . $pdoConfig['database'];

            $dsn .= ';host=' . ($pdoConfig['host'] ?: 'localhost');
            $dsn .= ';port=' . ($pdoConfig['port'] ?: 5432);

            if (!empty($pdoConfig['application_name'])) {
                $dsn .= ';application_name=' . $pdoConfig['application_name'];
            }

            $pdo = new PDO($dsn, $pdoConfig['username'], $pdoConfig['password']);

            if (!empty($pdoConfig['search_path'])) {
                $pdo->query('SET search_path = "'.implode('","', $pdoConfig['search_path']).'"')->closeCursor();
            }
        }

        return parent::createInstance($pdo);
    }

    public function quoteValue($value)
    {
        return $value === null ? 'NULL' : $this->pdo->quote($value);
    }
}