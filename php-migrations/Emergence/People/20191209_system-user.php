<?php

$tableName = User::$tableName;

// create table if it doesn't exist
if (!static::tableExists($tableName)) {
    DB::multiQuery(SQL::getCreateTable(User::class));
}

if (!User::getByWhere(['Username' => 'system'])) {
    DB::nonQuery(
        '
            INSERT INTO `%1$s` (Class, FirstName, LastName, Username, AccountLevel)
            VALUES ("%2$s", "System", "User", "system", "Developer")

        ',
        [
            $tableName,
            DB::escape(User::$defaultClass)
        ]
    );

    return DB::affectedRows() > 0 ? static::STATUS_EXECUTED : static::STATUS_SKIPPED;
}

return static::STATUS_SKIPPED;
