<?php

$newClassType = "enum('Media','PhotoMedia','AudioMedia','VideoMedia','PDFMedia')";

// skip conditions
$skipped = true;
if (!static::tableExists('media')) {
    printf("Skipping migration because table `media` does not exist yet\n");
    return static::STATUS_SKIPPED;
}


// migration
if (static::getColumnType('media', 'Class') != $newClassType) {
    print("Updating `Class` enum\n");
    DB::nonQuery('ALTER TABLE `media` CHANGE `Class` `Class` '.$newClassType.' NOT NULL');
    $skipped = false;
}

if (static::getColumnType('media', 'ContextClass') != 'varchar(255)') {
    print("Changing `ContextClass` to varchar\n");
    DB::nonQuery('ALTER TABLE `media` CHANGE `ContextClass` `ContextClass` VARCHAR(255) NOT NULL');
    $skipped = false;
}

if (static::getColumnType('media', 'MIMEType') != 'varchar(255)') {
    print("Changing `MIMEType` to varchar\n");
    DB::nonQuery('ALTER TABLE `media` CHANGE `MIMEType` `MIMEType` VARCHAR(255) NOT NULL');
    $skipped = false;
}


// done
return $skipped ? static::STATUS_SKIPPED : static::STATUS_EXECUTED;