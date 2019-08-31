<?php

namespace Emergence\Connectors;

use DB;

$tableName = Job::$tableName;

$skipped = true;

if (!static::tableExists($tableName)) {
    return static::STATUS_SKIPPED;
}

if (static::columnExists($tableName, 'Title') && !static::getColumnIsNullable($tableName, 'Title')) {
    printf('Updating column `Title` to allow null values');
    DB::nonQuery(
        'ALTER TABLE `%s` CHANGE COLUMN `Title` `Title` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL',
        $tableName
    );
    $skipped = false;
}

if (static::columnExists($tableName, 'Results') && !static::getColumnIsNullable($tableName, 'Results')) {
    printf('Updating column `Results` to allow null values');
    DB::nonQuery(
        'ALTER TABLE `%s` CHANGE COLUMN `Results` `Results` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NULL',
        $tableName
    );
    $skipped = false;
}

return $skipped ? static::STATUS_SKIPPED : static::STATUS_EXECUTED;