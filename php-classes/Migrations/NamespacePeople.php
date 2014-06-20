<?php

namespace Migrations;

class NamespacePeople extends AbstractMigration
{
    public static function upgrade()
    {
        // upgrade people table
        static::addSql('ALTER TABLE `people` CHANGE `Class` `Class` ENUM("Person","User","Emergence\\\\People\\\\Person","Emergence\\\\People\\\\User","Slate\\\\Student") NOT NULL');
        static::addSql('UPDATE `people` SET `Class` = "Emergence\\\\People\\\\Person" WHERE `Class` = "Person"');
        static::addSql('UPDATE `people` SET `Class` = "Emergence\\\\People\\\\User" WHERE `Class` = "User"');
        static::addSql('ALTER TABLE `people` CHANGE `Class` `Class` ENUM("Emergence\\\\People\\\\Person","Emergence\\\\People\\\\User","Slate\\\\Student") NOT NULL');

        // upgrade history_people table
        static::addSql('ALTER TABLE `history_people` CHANGE `Class` `Class` ENUM("Person","User","Emergence\\\\People\\\\Person","Emergence\\\\People\\\\User","Slate\\\\Student") NOT NULL');
        static::addSql('UPDATE `history_people` SET `Class` = "Emergence\\\\People\\\\Person" WHERE `Class` = "Person"');
        static::addSql('UPDATE `history_people` SET `Class` = "Emergence\\\\People\\\\User" WHERE `Class` = "User"');
        static::addSql('ALTER TABLE `history_people` CHANGE `Class` `Class` ENUM("Emergence\\\\People\\\\Person","Emergence\\\\People\\\\User","Slate\\\\Student") NOT NULL');
    }
}