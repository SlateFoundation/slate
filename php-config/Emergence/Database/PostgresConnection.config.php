<?php

use Emergence\Database\PostgresConnection;

if (!PostgresConnection::hasDefaultInstance() && ($postgresConfig = Site::getConfig('postgres'))) {
    PostgresConnection::setDefaultInstance($postgresConfig);
}