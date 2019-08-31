<?php

// skip conditions
if (!static::tableExists('groups')) {
    printf("Skipping migration because table `groups` does not exist yet\n");
    return static::STATUS_SKIPPED;
}

if (static::getColumnIsNullable('groups', 'Founded')) {
    printf("Skipping migration because `Founded` is already nullable\n");
    return static::STATUS_SKIPPED;
}


// migration
DB::nonQuery('ALTER TABLE `groups` CHANGE `Founded` `Founded` timestamp NULL default NULL');


// done
return static::STATUS_EXECUTED;