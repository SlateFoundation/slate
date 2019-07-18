<?php

namespace Slate\Connectors;

$tableName = Job::$tableName;


// skip conditions
if (!static::tableExists($tableName)) {
    printf("Skipping migration because table `%s` does not exist yet\n", $tableName);
    return static::STATUS_SKIPPED;
}


// retrieve current and configured list of classes
$configuredClasses = Job::getStaticSubClasses();
$currentClasses = array_map(
    'stripslashes',
    explode(
        "','",
        substr(static::getColumnType($tableName, 'Class'), 6, -2)
    )
);


// calculate classes to add, skip migration if none
$addClasses = array_diff($configuredClasses, $currentClasses);
if (!count($addClasses)) {
    printf("Skipping migration because Class column already contains all needed values\n");
    return static::STATUS_SKIPPED;
}


// calculate classes to delete, throw exception if any found
$deleteClasses = array_diff($currentClasses, $configuredClasses);
if (count($deleteClasses)) {
    throw new \Exception('unexpected additional classes in table already: '.implode(',', $deleteClasses));
}


// append Class values
printf("Upgrading %s table\n", $tableName);
\DB::nonQuery(
    'ALTER TABLE `%s` CHANGE  `Class` `Class` enum("%s") NOT NULL',
    [
        $tableName,
        implode('","', \DB::escape($configuredClasses))
    ]
);

return static::STATUS_EXECUTED;
