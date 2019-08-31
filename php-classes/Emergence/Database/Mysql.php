<?php

namespace Emergence\Database;

class Mysql extends AbstractConnectionSingleton
{
    public static $connectionClass = MysqlConnection::class;
}
