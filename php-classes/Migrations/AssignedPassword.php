<?php

namespace Migrations;

class AssignedPassword extends AbstractMigration
{
    static public function upgrade()
    {
        static::addSql('ALTER TABLE `people` CHANGE `PasswordClear` `AssignedPassword` VARCHAR(255) NULL DEFAULT NULL');
        static::addSql('ALTER TABLE `history_people` CHANGE `PasswordClear` `AssignedPassword` VARCHAR(255) NULL DEFAULT NULL');
    }
}