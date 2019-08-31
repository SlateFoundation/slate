<?php

use Emergence\CMS;

$oldTableName = 'content';
$newTableName = 'content_blocks';
$columnName = 'Class';
$oldColumnType = 'enum(\'Content\')';
$newColumnType = 'enum(\'Emergence\\\\CMS\\\\ContentBlock\')';

// skip conditions
if (!static::tableExists($oldTableName)) {
    printf("Skipping migration because table `%s` does not exist yet\n", $oldTableName);
    return static::STATUS_SKIPPED;
}

if (static::getColumnType($oldTableName, $columnName) != $oldColumnType) {
    printf("Column `%s`.`%s` does not match legacy type %s, it must be a blog/page table\n", $oldTableName, $columnName, $oldColumnType);
    return static::STATUS_SKIPPED;
}


// migration
printf("Renaming table `%s` to `%s`\n", $oldTableName, $newTableName);
DB::nonQuery('RENAME TABLE `%s` TO `%s`', array($oldTableName, $newTableName));

printf("Renaming table `history_%s` to `history_%s`\n", $oldTableName, $newTableName);
DB::nonQuery('RENAME TABLE `history_%s` TO `history_%s`', array($oldTableName, $newTableName));

printf("Changing column `%s`.`%s` to type %s\n", $newTableName, $columnName, $newColumnType);
DB::nonQuery(
    'ALTER TABLE `%1$s` CHANGE `%2$s` `%2$s` %3$s NOT NULL',
    array(
        $newTableName,
        $columnName,
        $newColumnType
    )
);

DB::nonQuery(
    'UPDATE `%s` SET `%s` = "Emergence\\\\CMS\\\\ContentBlock"',
    array(
        $newTableName,
        $columnName
    )
);


printf("Changing column `history_%s`.`%s` to type %s\n", $newTableName, $columnName, $newColumnType);
DB::nonQuery(
    'ALTER TABLE `history_%1$s` CHANGE `%2$s` `%2$s` %3$s NOT NULL',
    array(
        $newTableName,
        $columnName,
        $newColumnType
    )
);

DB::nonQuery(
    'UPDATE `history_%s` SET `%s` = "Emergence\\\\CMS\\\\ContentBlock"',
    array(
        $newTableName,
        $columnName
    )
);


// done
return static::STATUS_EXECUTED;