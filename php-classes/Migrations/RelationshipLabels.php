<?php

namespace Migrations;

class RelationshipLabels extends AbstractMigration
{
    public static function upgrade()
    {
        static::addSql('ALTER TABLE `relationships` CHANGE `Relationship` `Label` VARCHAR(255) NOT NULL');
        static::addSql('ALTER TABLE `history_relationships` CHANGE `Relationship` `Label` VARCHAR(255) NOT NULL');
    }
}