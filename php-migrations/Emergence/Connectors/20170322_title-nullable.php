<?php

namespace Emergence\Connectors;

use DB;

// skip conditions
if (!static::tableExists(Job::$tableName)) {
    printf("Skipping migration because table `%s` does not exist yet\n", Job::$tableName);
    return static::STATUS_SKIPPED;
}

if (static::getColumnIsNullable(Job::$tableName, 'Title')) {
    printf("Skipping migration because column `Title` is already nullable\n");
    return static::STATUS_SKIPPED;
}

// migration
DB::nonQuery('ALTER TABLE `%s` CHANGE `Title` `Title` VARCHAR(255) NULL default NULL', Job::$tableName);

// done
return static::STATUS_EXECUTED;