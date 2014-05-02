<?php

namespace Migrations;

class NamespaceLocations extends AbstractMigration
{
    public static function upgrade()
    {
        static::addSql('ALTER TABLE `locations` CHANGE  `Class` `Class` ENUM("Emergence\\\\Locations\\\\Location") NOT NULL');
        static::addSql('UPDATE `locations` SET `Class` = "Emergence\\\\Locations\\\\Location"');
        static::addSql('ALTER TABLE `history_locations` CHANGE  `Class`  `Class` ENUM("Emergence\\\\Locations\\\\Location") NOT NULL');
        static::addSql('UPDATE `history_locations` SET `Class` = "Emergence\\\\Locations\\\\Location"');
    }
}