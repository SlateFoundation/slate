<?php

namespace Slate\Progress;

use DB;
use Slate\Progress\Narratives\Report;

$tableName = Report::$tableName;
$columnName = 'NotesFormat';
$columnDefinition = "ENUM ('html', 'markdown') NULL DEFAULT 'markdown' AFTER `Notes`";

// skip if people table not generated yet
if (!static::tableExists($tableName)) {
    print("Skipping migration because table `$tableName` doesn't exist yet\n");
    return static::STATUS_SKIPPED;
}

if (static::columnExists($tableName, $columnName)) {
    print("Skipping migration because column `$tableName`.`$columnName` exists already.");
    return static::STATUS_SKIPPED;
}

// create column
print("Adding column `$tableName`.`$columnName`");
DB::nonQuery(
    "ALTER TABLE `$tableName` ADD COLUMN `$columnName` $columnDefinition"
);

// create history table column
print("Adding column `history_$tableName`.`$columnName`");
DB::nonQuery(
    "ALTER TABLE `history_$tableName` ADD COLUMN `$columnName` $columnDefinition"
);

// update values for records created before Sept. 2016, setting NotesFormat to HTML
$oldTimestamp = strtotime("09/01/2016");
$oldReportIds = DB::allValues(
    'ID',
    "SELECT ID FROM `$tableName` WHERE UNIX_TIMESTAMP(Created) < $oldTimestamp"
);

$totalReports = count($oldReportIds);
if ($totalReports) {
    print("Updating $totalReports reports format to 'html'");
    DB::nonQuery(
        "UPDATE `$tableName` SET NotesFormat = 'html' WHERE ID IN (%s)",
        join(", ", $oldReportIds)
    );
}

return static::STATUS_EXECUTED;