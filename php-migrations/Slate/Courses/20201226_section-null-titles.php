<?php

$tableName = 'course_sections';
$historyTableName = 'history_course_sections';


if (!static::tableExists($tableName)) {
    printf("Skipping migration because table `%s` doesn't exist yet\n", $tableName);
    return static::STATUS_SKIPPED;
}

if (static::getColumnIsNullable($tableName, 'Title')) {
    printf("Skipping migration because table `%s` already has nullable Title column\n", $tableName);
    return static::STATUS_SKIPPED;
}


printf("Upgrading %s table\n", $tableName);
DB::nonQuery('ALTER TABLE `%s` CHANGE  `Title` `Title` varchar(255) NULL default NULL', $tableName);

printf("Upgrading %s table\n", $historyTableName);
DB::nonQuery('ALTER TABLE `%s` CHANGE  `Title` `Title` varchar(255) NULL default NULL', $historyTableName);

printf("Removing section titles that match course titles\n");
DB::nonQuery('UPDATE `%s` SET Title = NULL WHERE Title = (SELECT Title FROM courses WHERE ID = CourseID)', $tableName);
printf("Removed titles from %u sections\n", DB::affectedRows());


return static::STATUS_EXECUTED;