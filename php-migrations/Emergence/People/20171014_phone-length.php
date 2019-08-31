<?php

// skip conditions
$skipped = true;
if (!static::tableExists('people')) {
    printf("Skipping migration because table `people` does not exist yet\n");
    return static::STATUS_SKIPPED;
}

// migration
if (static::getColumn('people', 'Phone') && static::getColumnType('people', 'Phone') !== 'decimal(15,0) unsigned') {
    print("Altering length of field `Phone` on table `people`\n");
    DB::nonQuery("ALTER TABLE `people` CHANGE COLUMN `Phone` `Phone` DECIMAL(15) UNSIGNED NULL DEFAULT NULL  COMMENT '' AFTER `Email`;");
    $skipped = false;
}

if (static::getColumn('history_people', 'Phone') && static::getColumnType('history_people', 'Phone') !== 'decimal(15,0) unsigned') {
    print("Altering length of field `Phone` on table `history_people`\n");
    DB::nonQuery("ALTER TABLE `history_people` CHANGE COLUMN `Phone` `Phone` DECIMAL(15) UNSIGNED NULL DEFAULT NULL  COMMENT '' AFTER `Email`;");
    $skipped = false;
}

// done
return $skipped ? static::STATUS_SKIPPED : static::STATUS_EXECUTED;
