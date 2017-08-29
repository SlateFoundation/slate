<?php

namespace Emergence\CRM;

use DB;

if (!static::tableExists(Message::$tableName)) {
    printf('Table `%s` not found, skipping migration.', Message::$tableName);
    return static::STATUS_SKIPPED;
}

if (!static::getColumnDefault(Message::$tableName, 'MessageFormat')) {
    DB::nonQuery('ALTER TABLE `%s` ALTER COLUMN `MessageFormat` SET DEFAULT "html"', Message::$tableName);
}

return static::STATUS_EXECUTED;