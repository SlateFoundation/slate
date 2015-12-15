<?php

namespace Migrations;

class NamespaceSchedules extends AbstractMigration
{
    public static function upgrade()
    {
        static::addSql('ALTER TABLE `course_schedules` CHANGE  `Class`  `Class` ENUM("Slate\\\\Courses\\\\Schedule") NOT NULL');
        static::addSql('UPDATE `course_schedules` SET `Class` = "Slate\\\\Courses\\\\Schedule"');
        static::addSql('ALTER TABLE `history_course_schedules` CHANGE  `Class`  `Class` ENUM("Slate\\\\Courses\\\\Schedule") NOT NULL');
        static::addSql('UPDATE `history_course_schedules` SET `Class` = "Slate\\\\Courses\\\\Schedule"');
    }
}