<?php

$skipped = true;

if (!static::tableExists('people')) {
    printf("Skipping migration because table `people` does not exist yet\n");
    return static::STATUS_SKIPPED;
}

// migration
if (!static::columnExists('people', 'NameSuffix')) {
    print("Adding field `NameSuffix` to table `people`'\n");
    DB::nonQuery("ALTER TABLE `people` ADD COLUMN `NameSuffix` varchar(255) NULL default NULL");
    DB::nonQuery("ALTER TABLE `history_people` ADD COLUMN `NameSuffix` varchar(255) NULL default NULL");
    $skipped = false;
}

// done
return $skipped ? static::STATUS_SKIPPED : static::STATUS_EXECUTED;
