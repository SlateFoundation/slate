<?php

use Emergence\Database\MysqlConnection;

if (!MysqlConnection::hasDefaultInstance() && ($mysqlConfig = Site::getConfig('mysql'))) {
    MysqlConnection::setDefaultInstance($mysqlConfig);
}