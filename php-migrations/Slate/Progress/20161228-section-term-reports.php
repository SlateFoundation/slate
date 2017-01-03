<?php

namespace Slate\Progress;

use DB, SQL;
use Slate\Progress\SectionTermReport;

$oldTable = 'narrative_reports';
$oldHistoryTable = 'history_'.$oldTable;

$class = SectionTermReport::class;
$table = $class::$tableName;
$historyTable = $class::getHistoryTableName();

$skipped = true;

if (static::tableExists($oldTable)) {

    // create new tables
    if (!static::tableExists($table)) {
        $skipped = false;
        // create section term report tables
        $tableQuery = SQL::getCreateTable($class); // will also append historyTable sql

        print("Creating new tables: $table, $historyTable<br>");
        DB::multiQuery($tableQuery);
    }

    // migrate records
    $totalRecords = DB::oneValue(
        'SELECT COUNT(*) FROM `%s`',
        $oldTable
    );
    print("Existing records found: $totalRecords<br>");

    if ($totalRecords) {
        $skipped = false;
        print("Checking for extra columns...<br>");
        $extraColumns = array_filter([
            'SbgWorksheet',
            'Assessment',
            'Grade'
        ], function($column) use ($table, $oldTable) {
            return static::columnExists($oldTable, $column) && static::columnExists($table, $column);
        });

        if (!empty($extraColumns)) {
            $extraColumnDefinitions = join(", ", array_map(function($column) { return "`$column`";}, $extraColumns));
            $extraColumns = join(", ", array_map(function($column) { return "$column";}, $extraColumns));
            print("Found extra columns: $extraColumns<br>");
        } else {
            $extraColumnDefinitions = '';
            $extraColumns = '';
            print("No extra columns found.<br>");
        }


        $insertStatement = sprintf(
            "INSERT INTO `%s` (`TermID`, `SectionID`, `StudentID`, `Status`, `Notes`, `NotesFormat`, `Class`, `Created`, `CreatorID`, `Modified`, `ModifierID`%s) ".
            " (".
                "SELECT TermID, CourseSectionID, StudentID, Status, Notes, NotesFormat, '%s', Created, CreatorID, Modified, ModifierID%s FROM `%s`".
            ")",
            $table,
            $extraColumnDefinitions ? (", ".$extraColumnDefinitions) : '',
            DB::escape($class),
            $extraColumns ? (", ". $extraColumns) : '',
            $oldTable
        );
        print("Inserting records {$oldTable} -> {$table}<br>");


        DB::nonQuery($insertStatement);
    }

    $recordsCreated = $class::getCount();
    if ($totalRecords != $recordsCreated) {
        print("Total records found ($recordsCreated) does not match old table: $totalRecords <br>");
        return static::STATUS_FAILED;
    }
}

return $skipped ? static::STATUS_SKIPPED : static::STATUS_EXECUTED;