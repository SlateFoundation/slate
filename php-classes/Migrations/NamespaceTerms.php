<?php

namespace Migrations;

class NamespaceTerms extends AbstractMigration
{
    public static function upgrade()
    {
        static::addSql('RENAME TABLE `course_terms` TO `terms`');
        static::addSql('ALTER TABLE  `terms` CHANGE  `Class`  `Class` ENUM("Slate\\\\Term") NOT NULL');
        static::addSql('UPDATE `terms` SET `Class` = "Slate\\\\Term"');
        static::addSql('RENAME TABLE `history_course_terms` TO `history_terms`');
        static::addSql('ALTER TABLE  `history_terms` CHANGE  `Class`  `Class` ENUM("Slate\\\\Term") NOT NULL');
        static::addSql('UPDATE `history_terms` SET `Class` = "Slate\\\\Term"');
    }
}