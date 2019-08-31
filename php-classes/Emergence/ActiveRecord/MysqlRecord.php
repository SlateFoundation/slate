<?php

namespace Emergence\ActiveRecord;

use PDO;

abstract class MysqlRecord extends AbstractSqlRecord
{
    public static $defaultConnection = \Emergence\Database\Mysql::class;
}
