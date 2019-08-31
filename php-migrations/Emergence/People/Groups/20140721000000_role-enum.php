<?php

$newGroupRollType = 'enum(\'Member\',\'Administrator\',\'Owner\',\'Founder\')';

// skip conditions
if (!static::tableExists('group_members')) {
    printf("Skipping migration because table `group_members` does not exist yet\n");
    return static::STATUS_SKIPPED;
}

if (static::getColumnType('group_members', 'Role') == $newGroupRollType) {
    printf("Skipping migration because `Role` column already has correct type\n");
    return static::STATUS_SKIPPED;
}


// migration
DB::nonQuery('ALTER TABLE `group_members` CHANGE `Role` `Role` '.$newGroupRollType.' NOT NULL');


// done
return static::STATUS_EXECUTED;