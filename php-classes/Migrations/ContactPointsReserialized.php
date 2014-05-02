<?php

namespace Migrations;

class ContactPointsReserialized extends AbstractMigration
{
    public static function upgrade()
    {
        // check for duplicate PrimaryEmail values
#        Person->Address -> Person->Postal
        // re-encode data fields
    }
}