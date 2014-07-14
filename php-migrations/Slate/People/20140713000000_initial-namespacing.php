<?php

$newType = 'enum(\'Emergence\\\\People\\\\Person\',\'Emergence\\\\People\\\\User\',\'Slate\\\\People\\\\Student\')';

// skip if people table not generated yet
if (!DB::oneRecord('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "people"')) {
    print("Skipping migration because table doesn't exist yet\n");
    return static::STATUS_SKIPPED;
}

// skip if Class column type already matches new type
if ($newType == DB::oneValue('SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "people" AND COLUMN_NAME = "Class"')) {
    print("Skipping migration because table already has correct Class column type\n");
    return static::STATUS_SKIPPED;
}

// upgrade people table
print("Upgrading people table\n");
DB::nonQuery('ALTER TABLE `people` CHANGE `Class` `Class` ENUM("Person","User","Student","Slate\\\\Student","Emergence\\\\People\\\\Person","Emergence\\\\People\\\\User","Slate\\\\People\\\\Student") NOT NULL');
DB::nonQuery('UPDATE `people` SET `Class` = "Emergence\\\\People\\\\Person" WHERE `Class` = "Person"');
DB::nonQuery('UPDATE `people` SET `Class` = "Emergence\\\\People\\\\User" WHERE `Class` = "User"');
DB::nonQuery('UPDATE `people` SET `Class` = "Slate\\\\People\\\\Student" WHERE `Class` = "Student" OR `Class` = "Slate\\\\Student"');
DB::nonQuery('ALTER TABLE `people` CHANGE `Class` `Class` '.$newType.' NOT NULL');

// upgrade history_people table
print("Upgrading history_people table\n");
DB::nonQuery('ALTER TABLE `history_people` CHANGE `Class` `Class` ENUM("Person","User","Student","Slate\\\\Student","Emergence\\\\People\\\\Person","Emergence\\\\People\\\\User","Slate\\\\People\\\\Student") NOT NULL');
DB::nonQuery('UPDATE `history_people` SET `Class` = "Emergence\\\\People\\\\Person" WHERE `Class` = "Person"');
DB::nonQuery('UPDATE `history_people` SET `Class` = "Emergence\\\\People\\\\User" WHERE `Class` = "User"');
DB::nonQuery('UPDATE `history_people` SET `Class` = "Slate\\\\People\\\\Student" WHERE `Class` = "Student" OR `Class` = "Slate\\\\Student"');
DB::nonQuery('ALTER TABLE `history_people` CHANGE `Class` `Class` '.$newType.' NOT NULL');


return static::STATUS_EXECUTED;