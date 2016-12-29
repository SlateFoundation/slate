<?php

// skip conditions
if (!static::tableExists('events')) {
    printf("Skipping migration because table `events` does not exist yet\n");
    return static::STATUS_SKIPPED;
}

if (static::getColumnIsNullable('events', 'StartTime')) {
    printf("Skipping migration because `StartTime` is already nullable\n");
    return static::STATUS_SKIPPED;
}


// migration
DB::nonQuery('ALTER TABLE `events` CHANGE `StartTime` `StartTime` timestamp NULL default NULL');


// done
return static::STATUS_EXECUTED;