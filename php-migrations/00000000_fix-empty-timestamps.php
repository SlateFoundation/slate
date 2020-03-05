<?php


// assume migration is skipped until an upgradable value is found
$skipped = true;


// check all timestamp columns
$timestampColumns = DB::allRecords('
    SELECT TABLE_NAME,
           COLUMN_NAME,
           IS_NULLABLE,
           COLUMN_TYPE
      FROM information_schema.`COLUMNS`
      JOIN information_schema.`TABLES` USING (TABLE_SCHEMA, TABLE_NAME)
     WHERE TABLE_SCHEMA = SCHEMA()
       AND DATA_TYPE = "timestamp"
       AND TABLE_TYPE = "BASE TABLE"
');

foreach($timestampColumns as $timestampColumn) {
    $rowsCount = DB::oneValue(
        'SELECT COUNT(*) FROM `%s` WHERE `%s` = 0',
        [
            $timestampColumn['TABLE_NAME'],
            $timestampColumn['COLUMN_NAME']
        ]
    );

    // check if table contains any affected rows
    if ($rowsCount == 0) {
        continue;
    }

    printf("Found %u rows with zero timestamps for `%s`.`%s`\n", $rowsCount, $timestampColumn['TABLE_NAME'], $timestampColumn['COLUMN_NAME']);
    $skipped = false;

    // reconfigure column to be nullable if needed
    if ($timestampColumn['IS_NULLABLE'] == 'NO') {
        printf("Enabling NULL values for `%s`.`%s`\n", $timestampColumn['TABLE_NAME'], $timestampColumn['COLUMN_NAME']);

        DB::nonQuery('SET sql_mode = ""');
        DB::nonQuery(
            'ALTER TABLE `%s` MODIFY COLUMN `%s` %s NULL',
            [
                $timestampColumn['TABLE_NAME'],
                $timestampColumn['COLUMN_NAME'],
                $timestampColumn['COLUMN_TYPE']
            ]
        );
    }

    // patch all zeroed timestamps to NULL
    printf("Updating %u zero timestamps to NULL for `%s`.`%s`\n", $rowsCount, $timestampColumn['TABLE_NAME'], $timestampColumn['COLUMN_NAME']);
    DB::nonQuery(
        'UPDATE `%1$s` SET `%2$s` = NULL WHERE `%2$s` = 0',
        [
            $timestampColumn['TABLE_NAME'],
            $timestampColumn['COLUMN_NAME']
        ]
    );
}


// done
return $skipped ? static::STATUS_SKIPPED : static::STATUS_EXECUTED;
