<?php

// skip conditions
if (!static::tableExists('groups')) {
    printf("Skipping migration because table `groups` does not exist yet\n");
    return static::STATUS_SKIPPED;
}

if (static::getColumnKey('groups', 'Left') == 'UNI') {
    print("Skipping because column `Left` in table `groups` is already unique\n");
    return static::STATUS_SKIPPED;
}


// migration
DB::nonQuery('ALTER TABLE groups ADD UNIQUE `Left` (`Left`)');


// done
return static::STATUS_EXECUTED;