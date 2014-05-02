<?php

namespace Migrations;

class NamespaceContactPoints extends AbstractMigration
{
    public static function upgrade()
    {
        static::addSql('ALTER TABLE `contact_points` CHANGE `Class` `Class` ENUM("EmailContactPoint","PhoneContactPoint","AddressContactPoint","NetworkContactPoint","LinkContactPoint","Emergence\\\\People\\\\ContactPoint\\\\Email","Emergence\\\\People\\\\ContactPoint\\\\Phone","Emergence\\\\People\\\\ContactPoint\\\\Postal","Emergence\\\\People\\\\ContactPoint\\\\Network","Emergence\\\\People\\\\ContactPoint\\\\Link") NOT NULL');
        static::addSql('UPDATE `contact_points` SET `Class` = "Emergence\\\\People\\\\ContactPoint\\\\Email" WHERE `Class` = "EmailContactPoint"');
        static::addSql('UPDATE `contact_points` SET `Class` = "Emergence\\\\People\\\\ContactPoint\\\\Phone" WHERE `Class` = "PhoneContactPoint"');
        static::addSql('UPDATE `contact_points` SET `Class` = "Emergence\\\\People\\\\ContactPoint\\\\Postal" WHERE `Class` = "AddressContactPoint"');
        static::addSql('UPDATE `contact_points` SET `Class` = "Emergence\\\\People\\\\ContactPoint\\\\Network" WHERE `Class` = "NetworkContactPoint"');
        static::addSql('UPDATE `contact_points` SET `Class` = "Emergence\\\\People\\\\ContactPoint\\\\Link" WHERE `Class` = "LinkContactPoint"');
        static::addSql('ALTER TABLE `contact_points` CHANGE `Class` `Class` ENUM("Emergence\\\\People\\\\ContactPoint\\\\Email","Emergence\\\\People\\\\ContactPoint\\\\Phone","Emergence\\\\People\\\\ContactPoint\\\\Postal","Emergence\\\\People\\\\ContactPoint\\\\Network","Emergence\\\\People\\\\ContactPoint\\\\Link") NOT NULL');

        static::addSql('ALTER TABLE `history_contact_points` CHANGE `Class` `Class` ENUM("EmailContactPoint","PhoneContactPoint","AddressContactPoint","NetworkContactPoint","LinkContactPoint","Emergence\\\\People\\\\ContactPoint\\\\Email","Emergence\\\\People\\\\ContactPoint\\\\Phone","Emergence\\\\People\\\\ContactPoint\\\\Postal","Emergence\\\\People\\\\ContactPoint\\\\Network","Emergence\\\\People\\\\ContactPoint\\\\Link") NOT NULL');
        static::addSql('UPDATE `history_contact_points` SET `Class` = "Emergence\\\\People\\\\ContactPoint\\\\Email" WHERE `Class` = "EmailContactPoint"');
        static::addSql('UPDATE `history_contact_points` SET `Class` = "Emergence\\\\People\\\\ContactPoint\\\\Phone" WHERE `Class` = "PhoneContactPoint"');
        static::addSql('UPDATE `history_contact_points` SET `Class` = "Emergence\\\\People\\\\ContactPoint\\\\Postal" WHERE `Class` = "AddressContactPoint"');
        static::addSql('UPDATE `history_contact_points` SET `Class` = "Emergence\\\\People\\\\ContactPoint\\\\Network" WHERE `Class` = "NetworkContactPoint"');
        static::addSql('UPDATE `history_contact_points` SET `Class` = "Emergence\\\\People\\\\ContactPoint\\\\Link" WHERE `Class` = "LinkContactPoint"');
        static::addSql('ALTER TABLE `history_contact_points` CHANGE `Class` `Class` ENUM("Emergence\\\\People\\\\ContactPoint\\\\Email","Emergence\\\\People\\\\ContactPoint\\\\Phone","Emergence\\\\People\\\\ContactPoint\\\\Postal","Emergence\\\\People\\\\ContactPoint\\\\Network","Emergence\\\\People\\\\ContactPoint\\\\Link") NOT NULL');
    }
}