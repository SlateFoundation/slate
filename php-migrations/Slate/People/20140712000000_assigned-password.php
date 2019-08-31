<?php

$skipped = false;

// skip if people table not generated yet
if (!static::tableExists('people')) {
    print("Skipping migration because table `people` doesn't exist yet\n");
    return static::STATUS_SKIPPED;
}

// skip if people table already has AssignedPassword column
if (static::columnExists('people', 'AssignedPassword')) {
    print("Skipping migration because table `people` already has column `AssignedPassword`\n");
    return static::STATUS_SKIPPED;
}

// skip if people table does not have a legacy PasswordClear column to rename
if (!static::columnExists('people', 'PasswordClear')) {
    print("Skipping migration because table `people` does not have legacy column `PasswordClear`\n");
    return static::STATUS_SKIPPED;
}

print("Upgrading people table\n");
DB::nonQuery('ALTER TABLE `people` CHANGE `PasswordClear` `AssignedPassword` VARCHAR(255) NULL DEFAULT NULL');

print("Upgrading history_people table\n");
DB::nonQuery('ALTER TABLE `history_people` CHANGE `PasswordClear` `AssignedPassword` VARCHAR(255) NULL DEFAULT NULL');


return static::STATUS_EXECUTED;