<?php


// add columns to all history_ tables
$tableNames = DB::allValues('TABLE_NAME', 'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME LIKE "history_%%"');
print_r($tableNames);

foreach ($tableNames AS $tableName) {
    if (!static::columnExists($tableName, 'Modified')) {
        printf("Adding `Modified` column to `%s` table\n", $tableName);
        DB::nonQuery('ALTER TABLE `%s` ADD `Modified` timestamp NULL default NULL AFTER `CreatorID`', $tableName);
    }

    if (!static::columnExists($tableName, 'ModifierID')) {
        printf("Adding `ModifierID` column to `%s` table\n", $tableName);
        DB::nonQuery('ALTER TABLE `%s` ADD `ModifierID` int unsigned NULL default NULL AFTER `Modified`', $tableName);
    }

    $tableName = substr($tableName, 8);

    if (!static::columnExists($tableName, 'Modified')) {
        printf("Adding `Modified` column to `%s` table\n", $tableName);
        DB::nonQuery('ALTER TABLE `%s` ADD `Modified` timestamp NULL default NULL AFTER `CreatorID`', $tableName);
    }

    if (!static::columnExists($tableName, 'ModifierID')) {
        printf("Adding `ModifierID` column to `%s` table\n", $tableName);
        DB::nonQuery('ALTER TABLE `%s` ADD `ModifierID` int unsigned NULL default NULL AFTER `Modified`', $tableName);
    }
}


// done
return static::STATUS_EXECUTED;