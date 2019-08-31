<?php

// skip conditions
$skipped = true;
if (!static::tableExists('people')) {
    printf("Skipping migration because table `people` does not exist yet\n");
    return static::STATUS_SKIPPED;
}


// migration
if ('varchar(255)' != static::getColumnType('people', 'Password')) {
    print("Changing `Password` to VARCHAR(255) in table `people`'\n");
    DB::nonQuery('ALTER TABLE `people` CHANGE `Password` `Password` VARCHAR(255) NULL DEFAULT NULL');
    $skipped = false;
}

if ('varchar(255)' != static::getColumnType('history_people', 'Password')) {
    print("Changing `Password` to VARCHAR(255) in table `history_people`\n");
    DB::nonQuery('ALTER TABLE `history_people` CHANGE `Password` `Password` VARCHAR(255) NULL DEFAULT NULL');
    $skipped = false;
}


// done
return $skipped ? static::STATUS_SKIPPED : static::STATUS_EXECUTED;