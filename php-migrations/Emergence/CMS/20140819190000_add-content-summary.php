<?php

$tableName = 'content';
$columnName = 'Summary';

// skip conditions
if (!static::tableExists($tableName)) {
    printf("Skipping migration because table `%s` does not exist yet\n", $tableName);
    return static::STATUS_SKIPPED;
}

if (static::columnExists($tableName, $columnName)) {
    printf("Skipping migration because column `%s`.`%s` already exists\n", $tableName, $columnName);
    return static::STATUS_SKIPPED;
}


// migration
printf("Adding column `%s`.`%s`\n", $tableName, $columnName);
DB::nonQuery('ALTER TABLE `%s` ADD `%s` text NULL default NULL AFTER `Visibility`', array($tableName, $columnName));

printf("Adding column `history_%s`.`%s`\n", $tableName, $columnName);
DB::nonQuery('ALTER TABLE `history_%s` ADD `%s` text NULL default NULL AFTER `Visibility`', array($tableName, $columnName));


// done
return static::STATUS_EXECUTED;