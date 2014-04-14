<?php

namespace Migrations;

class NamespaceSectionParticipants extends AbstractMigration
{
    static public function upgrade()
    {
        static::addSql('ALTER TABLE `course_section_participants` CHANGE  `Class` `Class` ENUM("Slate\\\\Courses\\\\SectionParticipant") NOT NULL');
        static::addSql('UPDATE `course_section_participants` SET `Class` = "Slate\\\\Courses\\\\SectionParticipant"');
    }
}