<?php

// skip conditions
$skipped = true;
if (!static::tableExists('groups')) {
    printf("Skipping migration because table `groups` does not exist yet\n");
    return static::STATUS_SKIPPED;
}


// migration
if (static::columnExists('groups', 'Data')) {
    print("Dropping `Data` column from `groups`\n");
    DB::nonQuery('ALTER TABLE `groups` DROP `Data`');
    $skipped = false;
}

if (!static::columnExists('groups', 'About')) {
    print("Adding `About` column to `groups`\n");
    DB::nonQuery('ALTER TABLE `groups` ADD `About` text NULL default NULL');
    $skipped = false;
}


// done
return $skipped ? static::STATUS_SKIPPED : static::STATUS_EXECUTED;