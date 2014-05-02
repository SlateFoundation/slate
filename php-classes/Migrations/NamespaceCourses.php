<?php

namespace Migrations;

class NamespaceCourses extends AbstractMigration
{
    public static function upgrade()
    {
        static::addSql('ALTER TABLE `courses` CHANGE  `Class` `Class` ENUM("Slate\\\\Courses\\\\Course") NOT NULL');
        static::addSql('UPDATE `courses` SET `Class` = "Slate\\\\Courses\\\\Course"');
        static::addSql('ALTER TABLE `history_courses` CHANGE  `Class`  `Class` ENUM("Slate\\\\Courses\\\\Course") NOT NULL');
        static::addSql('UPDATE `history_courses` SET `Class` = "Slate\\\\Courses\\\\Course"');
    }
}