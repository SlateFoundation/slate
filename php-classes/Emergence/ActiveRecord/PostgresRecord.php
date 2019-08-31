<?php

namespace Emergence\ActiveRecord;

abstract class PostgresRecord extends AbstractSqlRecord
{
    public static $defaultConnection = \Emergence\Database\Postgres::class;
}
