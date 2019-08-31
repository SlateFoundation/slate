<?php

$newType = 'enum(\'Emergence\\\\Locations\\\\Location\')';

if (!DB::oneRecord('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "locations"')) {
    print("Skipping migration because table doesn't exist yet\n");
    return static::STATUS_SKIPPED;
}

if ($newType == DB::oneValue('SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "locations" AND COLUMN_NAME = "Class"')) {
    print("Skipping migration because table already has correct Class column type\n");
    return static::STATUS_SKIPPED;
}


print("Upgrading locations table\n");
DB::nonQuery('ALTER TABLE `locations` CHANGE  `Class` `Class` '.$newType.' NOT NULL');
DB::nonQuery('UPDATE `locations` SET `Class` = "Emergence\\\\Locations\\\\Location"');

print("Upgrading history_locations table\n");
DB::nonQuery('ALTER TABLE `history_locations` CHANGE  `Class` `Class` '.$newType.' NOT NULL');
DB::nonQuery('UPDATE `history_locations` SET `Class` = "Emergence\\\\Locations\\\\Location"');


return static::STATUS_EXECUTED;