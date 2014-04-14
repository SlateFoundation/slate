<?php

namespace Migrations;

class NamespaceStudents extends AbstractMigration
{
    static public function upgrade()
    {
        static::addSql('ALTER TABLE `people` CHANGE  `Class` `Class` ENUM("Person", "User", "Student", "Slate\\\\Student") NOT NULL');
        static::addSql('UPDATE `people` SET `Class` = "Slate\\\\Student" WHERE `Class` = "Student"');
        static::addSql('ALTER TABLE `people` CHANGE  `Class` `Class` ENUM("Person", "User", "Slate\\\\Student") NOT NULL');

        static::addSql('ALTER TABLE `history_people` CHANGE  `Class` `Class` ENUM("Person", "User", "Student", "Slate\\\\Student") NOT NULL');
        static::addSql('UPDATE `history_people` SET `Class` = "Slate\\\\Student" WHERE `Class` = "Student"');
        static::addSql('ALTER TABLE `history_people` CHANGE  `Class` `Class` ENUM("Person", "User", "Slate\\\\Student") NOT NULL');
    }
}