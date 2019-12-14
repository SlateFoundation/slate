<?php

$tableName = Person::$tableName;
$historyTableName = Person::getHistoryTableName();
$columnName = 'MiddleName';


// skip conditions
if (!static::tableExists($tableName)) {
    printf("Skipping migration because table `%s` does not exist yet\n", $tableName);
    return static::STATUS_SKIPPED;
}

if (static::columnExists($tableName, $columnName)) {
    printf("Skipping migration because column `%s` already exists in table `%s`\n", $columnName, $tableName);
    return static::STATUS_SKIPPED;
}



// migration
printf("Adding column `%s` to table `%s`\n", $columnName, $tableName);
DB::nonQuery('ALTER TABLE `%s` ADD `%s` VARCHAR(255) NULL default NULL AFTER `LastName`', [$tableName, $columnName]);
DB::nonQuery('ALTER TABLE `%s` ADD `%s` VARCHAR(255) NULL default NULL AFTER `LastName`', [$historyTableName, $columnName]);


// done
return static::STATUS_EXECUTED;
