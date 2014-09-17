<?php

use Emergence\Connectors\Mapping;


// skip conditions
if (!static::tableExists(Mapping::$tableName)) {
    printf("Skipping migration because table `%s` does not exist yet\n", Mapping::$tableName);
    return static::STATUS_SKIPPED;
}


// migration
DB::nonQuery(
    'UPDATE `%s` SET ExternalKey = "section[foreign_key]" WHERE Connector = "google-sheets" AND ExternalKey = "section_id"',
    Mapping::$tableName
);
printf("Changed 'section_id' -> 'section[foreign_key]' in %u rows\n", DB::affectedRows());


// done
return DB::affectedRows() > 0 ? static::STATUS_EXECUTED : static::STATUS_SKIPPED;