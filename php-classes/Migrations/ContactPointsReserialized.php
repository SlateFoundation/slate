<?php

namespace Migrations;

class ContactPointsReserialized extends AbstractMigration
{
    static public function upgrade()
    {
        // check for duplicate PrimaryEmail values
#        Person->Address -> Person->Postal
        // re-encode data fields
    }
}