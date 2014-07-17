<?php

$newType = 'enum(\'Emergence\\\\CMS\\\\Item\\\\Album\',\'Emergence\\\\CMS\\\\Item\\\\Embed\',\'Emergence\\\\CMS\\\\Item\\\\Media\',\'Emergence\\\\CMS\\\\Item\\\\RichText\',\'Emergence\\\\CMS\\\\Item\\\\Text\',\'Emergence\\\\CMS\\\\Item\\\\Markdown\')';

if (!DB::oneRecord('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "content_items"')) {
    print("Skipping migration because table doesn't exist yet\n");
    return static::STATUS_SKIPPED;
}

if ($newType == DB::oneValue('SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "content_items" AND COLUMN_NAME = "Class"')) {
    print("Skipping migration because table already has correct Class column type\n");
    return static::STATUS_SKIPPED;
}


print("Upgrading content_items table\n");
DB::nonQuery('ALTER TABLE `content_items` CHANGE  `Class` `Class` '.$newType.' NOT NULL');

print("Upgrading history_content_items table\n");
DB::nonQuery('ALTER TABLE `history_content_items` CHANGE  `Class` `Class` '.$newType.' NOT NULL');


return static::STATUS_EXECUTED;