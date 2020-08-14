<?php

$skipped = true;

if (!static::tableExists('relationships')) {
    printf("Skipping migration because table `relationships` does not exist yet\n");
    return static::STATUS_SKIPPED;
}

// migration
if (!static::columnExists('relationships', 'Slot')) {
    print("Adding field `Slot` to table `relationships`'\n");
    DB::nonQuery("ALTER TABLE `relationships` ADD COLUMN `Slot` varchar(255) NULL default NULL");
    DB::nonQuery("ALTER TABLE `history_relationships` ADD COLUMN `Slot` varchar(255) NULL default NULL");
    DB::nonQuery("ALTER TABLE `relationships` ADD UNIQUE KEY `PersonSlot` (`PersonID`,`Slot`)");
    $skipped = false;
}

// done
return $skipped ? static::STATUS_SKIPPED : static::STATUS_EXECUTED;
