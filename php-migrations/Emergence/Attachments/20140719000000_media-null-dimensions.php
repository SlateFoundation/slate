<?php

// skip conditions
$skipped = true;
if (!static::tableExists('media')) {
    printf("Skipping migration because table `media` does not exist yet\n");
    return static::STATUS_SKIPPED;
}


// migration
if (!static::getColumnIsNullable('media', 'Width')) {
    print("Enabling NULL for `Width`\n");
    DB::nonQuery('ALTER TABLE `media` CHANGE `Width` `Width` INT(10) UNSIGNED NULL DEFAULT NULL');
    $skipped = false;
}

if (!static::getColumnIsNullable('media', 'Height')) {
    print("Enabling NULL for `Height`\n");
    DB::nonQuery('ALTER TABLE `media` CHANGE `Height` `Height` INT(10) UNSIGNED NULL DEFAULT NULL');
    $skipped = false;
}

if (!static::getColumnIsNullable('media', 'Duration')) {
    print("Enabling NULL for `Duration`\n");
    DB::nonQuery('ALTER TABLE `media` CHANGE `Duration` `Duration` INT(10) UNSIGNED NULL DEFAULT NULL');
    $skipped = false;
}

if (!static::getColumnIsNullable('media', 'Caption')) {
    print("Enabling NULL for `Caption`\n");
    DB::nonQuery('ALTER TABLE `media` CHANGE `Caption` `Caption` INT(10) UNSIGNED NULL DEFAULT NULL');
    $skipped = false;
}


// done
return $skipped ? static::STATUS_SKIPPED : static::STATUS_EXECUTED;