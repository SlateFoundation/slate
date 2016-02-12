<?php

use Emergence\Connectors\Job;
use Emergence\Connectors\Mapping;

$skipped = true;
$newJobClassType = 'enum(\'Emergence\\\\Connectors\\\\Job\')';
$newMappingClassType = 'enum(\'Emergence\\\\Connectors\\\\Mapping\')';


// migration
if (static::tableExists(Job::$tableName) && static::getColumnType(Job::$tableName, 'Class') != $newJobClassType) {
    printf("Updating `%s`.`Class` enum to %s\n", Job::$tableName, $newJobClassType);
    DB::nonQuery('ALTER TABLE `%s` CHANGE `Class` `Class` %s NOT NULL', [Job::$tableName, $newJobClassType]);
    DB::nonQuery('UPDATE `%s` SET `Class` = "Emergence\\\\Connectors\\\\Job"', Job::$tableName);
    $skipped = false;
}

if (static::tableExists(Mapping::$tableName) && static::getColumnType(Mapping::$tableName, 'Class') != $newMappingClassType) {
    printf("Updating `%s`.`Class` enum to %s\n", Mapping::$tableName, $newMappingClassType);
    DB::nonQuery('ALTER TABLE `%s` CHANGE `Class` `Class` %s NOT NULL', [Mapping::$tableName, $newMappingClassType]);
    DB::nonQuery('UPDATE `%s` SET `Class` = "Emergence\\\\Connectors\\\\Mapping"', Mapping::$tableName);
    $skipped = false;
}


// done
return $skipped ? static::STATUS_SKIPPED : static::STATUS_EXECUTED;