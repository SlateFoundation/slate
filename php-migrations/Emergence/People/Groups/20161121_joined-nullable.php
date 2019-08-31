<?php

// skip conditions
if (!static::tableExists('group_members')) {
    printf("Skipping migration because table `group_members` does not exist yet\n");
    return static::STATUS_SKIPPED;
}

if (static::getColumnIsNullable('group_members', 'Joined')) {
    printf("Skipping migration because `Joined` is already nullable\n");
    return static::STATUS_SKIPPED;
}


// migration
DB::nonQuery('ALTER TABLE `group_members` CHANGE `Joined` `Joined` timestamp NULL default NULL');


// done
return static::STATUS_EXECUTED;