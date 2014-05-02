<?php

namespace Migrations;

class NamespaceSections extends AbstractMigration
{
    public static function upgrade()
    {
        // sections
        static::addSql('ALTER TABLE `course_sections` CHANGE  `Class` `Class` ENUM("Slate\\\\Courses\\\\Section") NOT NULL');
        static::addSql('UPDATE `course_sections` SET `Class` = "Slate\\\\Courses\\\\Section"');
        static::addSql('ALTER TABLE `history_course_sections` CHANGE  `Class`  `Class` ENUM("Slate\\\\Courses\\\\Section") NOT NULL');
        static::addSql('UPDATE `history_course_sections` SET `Class` = "Slate\\\\Courses\\\\Section"');

        // content contexts
        static::addSql('UPDATE `content` SET `ContextClass` = "Slate\\\\Courses\\\\Section" WHERE `ContextClass` = "CourseSection"');
        static::addSql('UPDATE `history_content` SET `ContextClass` = "Slate\\\\Courses\\\\Section" WHERE `ContextClass` = "CourseSection"');
    }
}