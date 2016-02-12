<?php

namespace Migrations;

use DB;
use Site;
use Emergence_FS;

abstract class AbstractMigration
{
    public static $sequence;

    public static $pretend = false;
    public static $printLog = true;
    public static $continueOnException = false;

    public static function upgrade()
    {
    }

    protected static function addSql($sql, $params = [])
    {
        if (static::$printLog) {
            print(DB::prepareQuery($sql, $params).';'.PHP_EOL);
        }

        if (!static::$pretend) {
            try {
                DB::nonQuery($sql, $params);
            } catch (\Exception $e) {
                if (static::$continueOnException) {
                    if (static::$printLog) {
                        printf("\t^ LAST QUERY FAILED: %s(%s, %u)\n", get_class($e), $e->getMessage(), $e->getCode());
                    }
                } else {
                    throw $e;
                }
            }
        }
    }

    public static function getAllBySequence()
    {
        $migrations = [];

        Emergence_FS::cacheTree('php-classes/Migrations');

        foreach (Emergence_FS::getTreeFiles('php-classes/Migrations') AS $migrationNode) {
            if (!is_a($migrationNode, 'SiteFile')) {
                continue;
            }

            $migrationName = basename($migrationNode->Handle, '.php');
#            \Debug::dumpVar($migrationNode, false);
            \Debug::dumpVar($migrationNode->getFullPath(null, true), false);

#            $class = new \ReflectionClass("Migrations\\$migrationName");
#    
#            if ($class->isAbstract()) {
#                continue;
#            }
#    
#            $migrations[$migrationClass] = $migrationClass::$sequence;
        }

        return $migrations;
    }
}