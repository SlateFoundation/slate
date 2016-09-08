<?php

// skip if people table not generated yet
if (!static::tableExists('people')) {
    print("Skipping migration because table `people` doesn't exist yet\n");
    return static::STATUS_SKIPPED;
}

// skip if people table already has TemporaryPassword column
if (static::columnExists('people', 'TemporaryPassword')) {
    print("Skipping migration because table `people` already has column `TemporaryPassword`\n");
    return static::STATUS_SKIPPED;
}

// create TemporaryPassword column
print("Adding column `TemporaryPassword` to table `people`\n");
DB::nonQuery('ALTER TABLE `people` ADD `TemporaryPassword` varchar(255) NULL default NULL AFTER Password');

print("Adding column `TemporaryPassword` to table `history_people`\n");
DB::nonQuery('ALTER TABLE `history_people` ADD `TemporaryPassword` varchar(255) NULL default NULL AFTER Password');

// Migrate any old AssignedPassword values if they still match the current password
if (static::columnExists('people', 'AssignedPassword')) {
    print("Migrating values from AssignedPassword column that are still current...\n");

    $affectedRows = 0;
    $results = DB::query('SELECT * FROM people WHERE AssignedPassword IS NOT NULL');

    while ($userData = $results->fetch_assoc()) {
        $User = Emergence\People\Person::instantiateRecord($userData);

        if (!$User instanceof Emergence\People\User) {
            continue;
        }

        if (!$User->verifyPassword($userData['AssignedPassword'])) {
            continue;
        }

        DB::nonQuery('UPDATE people SET TemporaryPassword = AssignedPassword WHERE ID = %u', $userData['ID']);
        $affectedRows += DB::affectedRows();
    }

    printf("Migrated %u assigned passwords to temporary passwords.\n", $affectedRows);

    print("Dropping column `AssignedPassword` from table `people`\n");
    DB::nonQuery('ALTER TABLE `people` DROP COLUMN `AssignedPassword`');
}



return static::STATUS_EXECUTED;