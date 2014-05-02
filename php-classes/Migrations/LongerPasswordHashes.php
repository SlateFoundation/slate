<?php

namespace Migrations;

class LongerPasswordHashes extends AbstractMigration
{
    static public function upgrade()
    {
        static::addSql('ALTER TABLE `people` CHANGE `Password` `Password` VARCHAR(255) NULL DEFAULT NULL');
        static::addSql('ALTER TABLE `history_people` CHANGE `Password` `Password` VARCHAR(255) NULL DEFAULT NULL');
    }
}