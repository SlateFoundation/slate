<?php

namespace Emergence\Database;

class Postgres extends AbstractConnectionSingleton
{
    public static $connectionClass = PostgresConnection::class;
}
