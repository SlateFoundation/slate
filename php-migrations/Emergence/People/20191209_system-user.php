<?php

namespace Emergence\People;

use DB;
use SQL;


function systemUserExists() {
    return !!User::getByWhere(['Username' => 'system']);
}

$tableName = User::$tableName;

if (!static::tableExists($tableName)) {
    printf('Table `%s` does not exist, skipping.', $tableName);
    return static::STATUS_SKIPPED;
}

if (!systemUserExists()) {
    DB::nonQuery(
        '
            INSERT INTO `%1$s` (Class, FirstName, LastName, Username, AccountLevel)
            VALUES ("%2$s", "System", "User", "system", "Administrator")

        ',
        [
            $tableName,
            DB::escape(User::class)
        ]
    );

    return systemUserExists() ? static::STATUS_EXECUTED : static::STATUS_FAILED;
}

return static::STATUS_SKIPPED;