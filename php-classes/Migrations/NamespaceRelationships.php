<?php

namespace Migrations;

class NamespaceRelationships extends AbstractMigration
{
    public static function upgrade()
    {
        static::addSql('ALTER TABLE `relationships` CHANGE `Class` `Class` ENUM("Relationship","Guardian","Emergence\\\\People\\\\Relationship","Emergence\\\\People\\\\GuardianRelationship") NOT NULL');
        static::addSql('UPDATE `relationships` SET `Class` = "Emergence\\\\People\\\\Relationship" WHERE `Class` = "Relationship"');
        static::addSql('UPDATE `relationships` SET `Class` = "Emergence\\\\People\\\\GuardianRelationship" WHERE `Class` = "Guardian"');
        static::addSql('ALTER TABLE `relationships` CHANGE `Class` `Class` ENUM("Emergence\\\\People\\\\Relationship","Emergence\\\\People\\\\GuardianRelationship") NOT NULL');

        static::addSql('ALTER TABLE `history_relationships` CHANGE `Class` `Class` ENUM("Relationship","Guardian","Emergence\\\\People\\\\Relationship","Emergence\\\\People\\\\GuardianRelationship") NOT NULL');
        static::addSql('UPDATE `history_relationships` SET `Class` = "Emergence\\\\People\\\\Relationship" WHERE `Class` = "Relationship"');
        static::addSql('UPDATE `history_relationships` SET `Class` = "Emergence\\\\People\\\\GuardianRelationship" WHERE `Class` = "Guardian"');
        static::addSql('ALTER TABLE `history_relationships` CHANGE `Class` `Class` ENUM("Emergence\\\\People\\\\Relationship","Emergence\\\\People\\\\GuardianRelationship") NOT NULL');
    }
}