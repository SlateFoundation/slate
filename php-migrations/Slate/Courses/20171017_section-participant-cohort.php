<?php

$skipped = true;

if (!static::tableExists('course_section_participants')) {
    printf("Skipping migration because table `course_section_participants` does not exist yet\n");
    return static::STATUS_SKIPPED;
}

// migration
if (!static::columnExists('course_section_participants', 'Cohort')) {
    print("Adding field `Cohort` to table `course_section_participants`'\n");
    DB::nonQuery("ALTER TABLE `course_section_participants` ADD COLUMN `Cohort` varchar(255) NULL default NULL");
    $skipped = false;
}

// done
return $skipped ? static::STATUS_SKIPPED : static::STATUS_EXECUTED;
