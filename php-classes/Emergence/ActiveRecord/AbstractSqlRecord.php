<?php

namespace Emergence\ActiveRecord;

use PDO;
use Emergence\Database\SqlConnectionInterface;
use Emergence\Database\ConnectionSingletonInterface;

abstract class AbstractSqlRecord extends AbstractActiveRecord
{
    public static $tableName;
    public static $defaultConnection = \Emergence\Database\Primary::class;

    public static function getTableName()
    {
        return static::$tableName;
    }

    public static function getConnection($connection = null)
    {
        $updateDefault = false;

        if (!$connection) {
            $connection = static::$defaultConnection;
            $updateDefault = true;
        }

        if (is_string($connection)) {
            if (is_a($connection, SqlConnectionInterface::class, true)) {
                $connection = $connection::getDefaultInstance();
            } elseif (is_a($connection, ConnectionSingletonInterface::class, true)) {
                $connection = $connection::getConnection();
            }

            if ($updateDefault) {
                static::$defaultConnection = $connection;
            }
        }

        return $connection;
    }

    public static function getByField($field, $value, array $options = [])
    {
        $connection = static::getConnection($options['connection']);

        $row = $connection->selectOne([
            'table' => static::getTableName(),
            'where' => [
                $field => $value
            ]
        ]);

        if ($options['instantiate'] !== false) {
            $className = $row['Class'] ?: static::class;
            $row = new $className($row, ['connection' => $connection]);
        }

        return $row;
    }

    public static function getAllByWhere(array $conditions = [], array $options = [])
    {
        $connection = static::getConnection($options['connection']);

        $options['table'] = static::getTableName();
        $options['where'] = $conditions;

        if ($options['instantiate'] !== false) {
            $defaultClass = static::class;
            $instanceOptions = ['connection' => $connection];
        } else {
            $instanceOptions = false;
        }

        $rows = $connection->selectAll($options);

        foreach ($rows AS $row) {
            if ($instanceOptions) {
                $className = $row['Class'] ?: $defaultClass;
                $row = new $className($row, $instanceOptions);
            }

            yield $row;
        }
    }

    // instance members
    protected $connection;

    // instance methods
    public function __construct(array $data = [], array $options = [])
    {
        parent::__construct($data, $options);

        if (!empty($options['connection'])) {
            $this->connection = $options['connection'];
        }
    }
}
