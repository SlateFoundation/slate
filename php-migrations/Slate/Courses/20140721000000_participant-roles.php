<?php

$newRollType = "enum('Observer','Student','Assistant','Teacher')";

// skip conditions
if (!static::tableExists('course_section_participants')) {
    printf("Skipping migration because table `course_section_participants` does not exist yet\n");
    return static::STATUS_SKIPPED;
}

if (static::getColumnType('course_section_participants', 'Role') == $newRollType) {
    printf("Skipping migration because `Role` column already has correct type\n");
    return static::STATUS_SKIPPED;
}


// migration
DB::nonQuery('ALTER TABLE `course_section_participants` CHANGE `Role` `Role` enum(\'Observer\',\'Student\',\'Assistant\',\'Teacher\',\'Instructor\',\'Administrator\') NOT NULL');
DB::nonQuery('UPDATE `course_section_participants` SET Role = "Teacher" WHERE Role = "Instructor" OR Role = "Administrator"');
DB::nonQuery('ALTER TABLE `course_section_participants` CHANGE `Role` `Role` '.$newRollType.' NOT NULL');


// done
return static::STATUS_EXECUTED;