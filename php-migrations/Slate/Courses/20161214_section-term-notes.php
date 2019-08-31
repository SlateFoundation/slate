<?php

namespace Slate\Courses;

use DB, SQL;

$oldTable = 'narrative_section_notes';

if (!static::tableExists($oldTable)) {
    return static::STATUS_SKIPPED;
}

$totalSectionNotes = DB::oneValue('SELECT COUNT(*) FROM `%s`', $oldTable);
// history table
$totalHistoricSectionNotes = DB::oneValue('SELECT COUNT(*) FROM `%s`', 'history_'.$oldTable);

if (!empty($totalSectionNotes) || !empty($totalHistoricSectionNotes)) {
    if (!static::tableExists(SectionTermData::$tableName)) {
        // create table
        $createTableSql = SQL::getCreateTable(SectionTermData::class);
        DB::multiQuery($createTableSql);
    }
}

$query = '
    INSERT INTO `%s` (`ID`, `TermID`, `SectionID`, `TermReportNotes`, `Created`, `CreatorID`, `Modified`, `ModifierID`, `Class`)
    SELECT ID, TermID, CourseSectionID as SectionID, Notes as TermReportNotes, Created, CreatorID, Modified, ModifierID, "%s" as Class
      FROM `%s`
     ORDER BY ID ASC
';

if (!empty($totalSectionNotes)) {
    DB::nonQuery($query, [SectionTermData::$tableName, DB::escape(SectionTermData::class), $oldTable]);
}

if (!empty($totalHistoricSectionNotes)) {
    DB::nonQuery($query, ['history_'.SectionTermData::$tableName, DB::escape(SectionTermData::class), 'history_'.$oldTable]);
}

$createdNotes = DB::oneValue('SELECT COUNT(*) FROM `%s`', SectionTermData::$tableName);

if ($createdNotes != $totalSectionNotes) {
    return static::STATUS_FAILED;
}

return static::STATUS_EXECUTED;