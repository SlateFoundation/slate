<?php

// skip conditions
if (!static::tableExists('tags')) {
    printf("Skipping migration because table `tags` does not exist yet\n");
    return static::STATUS_SKIPPED;
}

if (static::columnExists('tags', 'Class')) {
    printf("Skipping migration because column `Class` in table `tags` already exists\n");
    return static::STATUS_SKIPPED;
}


// migration
print("Adding `Class` column to `tags` table\n");
DB::nonQuery('ALTER TABLE `tags` ADD `Class` ENUM("Tag") NOT NULL AFTER `ID`;');


// done
return static::STATUS_EXECUTED;