<?php

// skip if people table not generated yet
if (!DB::oneRecord('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "people"')) {
    print("Skipping migration because table doesn't exist yet\n");
    return static::STATUS_SKIPPED;
}

// skip if people table already has AssignedPassword column
if (DB::oneRecord('SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "people" AND COLUMN_NAME = "AssignedPassword"')) {
    print("Skipping migration because table already has AssignedPassword column\n");
    return static::STATUS_SKIPPED;
}

print("Upgrading people table\n");
DB::nonQuery('ALTER TABLE `people` CHANGE `PasswordClear` `AssignedPassword` VARCHAR(255) NULL DEFAULT NULL');

print("Upgrading history_people table\n");
DB::nonQuery('ALTER TABLE `history_people` CHANGE `PasswordClear` `AssignedPassword` VARCHAR(255) NULL DEFAULT NULL');


return static::STATUS_EXECUTED;