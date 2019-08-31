<?php

// skip conditions
if (!static::tableExists(TagItem::$tableName)) {
    printf("Skipping migration because table `%s` does not exist yet\n", TagItem::$tableName);
    return static::STATUS_SKIPPED;
}


// migration
print("Updating tag items context class\n");
DB::nonQuery(
    'UPDATE `%s` SET `ContextClass` = "Emergence\\\\People\\\\Person" WHERE `ContextClass` = "Person"',
    [
        TagItem::$tableName
    ]
);


return DB::affectedRows() > 0 ? static::STATUS_EXECUTED : static::STATUS_SKIPPED;