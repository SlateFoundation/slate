<?php

namespace Emergence\SiteAdmin;

use DB;
use Site;
use Emergence_FS;
use TableNotFoundException;


class MigrationsRequestHandler extends \RequestHandler
{
    const STATUS_NEW = 'new';
    const STATUS_SKIPPED = 'skipped';
    const STATUS_STARTED = 'started';
    const STATUS_FAILED = 'failed';
    const STATUS_EXECUTED = 'executed';
    const STATUS_DEBUG = 'debug';

    public static $userResponseModes = [
        'application/json' => 'json',
        'text/csv' => 'csv'
    ];

    public static function handleRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Developer');

        if (static::peekPath() == 'refresh') {
            return static::handleRefreshRequest();
        } elseif (count(array_filter($migrationKey = static::getPath()))) {
            return static::handleMigrationRequest(implode('/', $migrationKey));
        }

        return static::handleBrowseRequest();
    }

    public static function handleBrowseRequest()
    {
        return static::respond('migrations',[
            'migrations' => static::getMigrations()
        ]);
    }

    public static function handleRefreshRequest()
    {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return static::respond('confirm', [
                'question' => 'Are you sure you want to query the parent site for new migration scripts and pull any that are found?'
            ]);
        }

        Site::$autoPull = true;
        $precached = Emergence_FS::cacheTree('php-migrations', true);

        return static::respond('message', [
            'title' => 'Migrations precached from parent site',
            'message' => "$precached new migrations have been pulled from the parent site"
        ]);
    }

    public static function handleMigrationRequest($migrationKey)
    {
        $migrationPath = 'php-migrations/'.$migrationKey.'.php';
        $migrationNode = Site::resolvePath($migrationPath);

        if (!$migrationNode) {
            return static::throwNotFoundError('Migration not found');
        }

        try {
            $migrationRecord = DB::oneRecord('SELECT * FROM _e_migrations WHERE `Key` = "%s"', DB::escape($migrationKey));
        } catch (TableNotFoundException $e) {
            $migrationRecord = null;
        }

        $migration = [
            'key' => $migrationKey,
            'path' => $migrationPath,
            'status' => $migrationRecord ? $migrationRecord['Status'] : static::STATUS_NEW,
            'executed' => $migrationRecord ? $migrationRecord['Timestamp'] : null,
            'sha1' => $migrationNode->SHA1
        ];


        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            if ($migrationRecord) {
                return static::throwError('Cannot execute requested migration, it has already been skipped, started, or executed');
            }

            $insertSql = sprintf('INSERT INTO `_e_migrations` SET `Key` = "%s", SHA1 = "%s", Timestamp = FROM_UNIXTIME(%u), Status = "%s"', $migrationKey, $migrationNode->SHA1, time(), static::STATUS_STARTED);

            try {
                DB::nonQuery($insertSql);
            } catch (TableNotFoundException $e) {
                static::createMigrationsTable();
                DB::nonQuery($insertSql);
            }

            \Site::$debug = true;
            $debugLogStartIndex = count(\Debug::$log);


            $resetMigrationStatus = function() use ($migrationKey) {
                static::resetMigrationStatus($migrationKey);
            };

            ob_start();
            $migration['status'] = call_user_func(function() use ($migration, $migrationNode, $resetMigrationStatus) {
                return include($migrationNode->RealPath);
            });
            $output = ob_get_clean();

            $migration['executed'] = time();

            if ($migration['status'] == static::STATUS_DEBUG) {
                static::resetMigrationStatus($migrationKey);
            } else {
                if (!in_array($migration['status'], [static::STATUS_SKIPPED, static::STATUS_EXECUTED])) {
                    $migration['status'] = static::STATUS_FAILED;
                }

                DB::nonQuery(
                    'UPDATE `_e_migrations` SET Timestamp = FROM_UNIXTIME(%u), Status = "%s" WHERE `Key` = "%s"',
                    [
                        $migration['executed'],
                        $migration['status'],
                        $migrationKey
                    ]
                );
            }

            return static::respond('migrationExecuted', [
                'migration' => $migration,
                'log' => array_slice(\Debug::$log, $debugLogStartIndex),
                'output' => $output
            ]);
        }

        return static::respond('migration', [
            'migration' => $migration
        ]);
    }

    public static function getMigrations()
    {
        static $migrations = null;

        if ($migrations) {
            return $migrations;
        }

        Emergence_FS::cacheTree('php-migrations');

        // get all migration status records from table
        try {
            $migrationRecords = DB::table('Key', 'SELECT * FROM _e_migrations');
        } catch (TableNotFoundException $e) {
            $migrationRecords = [];
        }

        // append sequence to each node
        $migrations = [];
        foreach (Emergence_FS::getTreeFiles('php-migrations') AS $migrationPath => $migrationNodeData) {
            $migrationKey = preg_replace('#^php-migrations/(.*)\.php$#i', '$1', $migrationPath);
            $migrationRecord = array_key_exists($migrationKey, $migrationRecords) ? $migrationRecords[$migrationKey] : null;
            preg_match('#^(\d{8})(\d*)#', basename($migrationKey), $matches);

            $migrations[$migrationKey] = [
                'key' => $migrationKey,
                'path' => 'php-migrations/'.$migrationKey.'.php',
                'status' => $migrationRecord ? $migrationRecord['Status'] : static::STATUS_NEW,
                'executed' => $migrationRecord ? $migrationRecord['Timestamp'] : null,
                'sha1' => $migrationNodeData['SHA1'],
                'sequence' => $matches && $matches[1] ? (int)$matches[1] : 0,
                'sequenceTime' => $matches && $matches[2] ? (int)$matches[2] : 0
            ];
        }

        // sort migrations by sequence
        uasort($migrations, function($a, $b) {
            if ($a['sequence'] == $b['sequence']) {
                if ($a['sequenceTime'] == $b['sequenceTime']) {
                    return 0;
                }

                return ($a['sequenceTime'] < $b['sequenceTime']) ? -1 : 1;
            }

            return ($a['sequence'] < $b['sequence']) ? -1 : 1;
        });

        return $migrations;
    }

    protected static function createMigrationsTable()
    {
        DB::nonQuery(
            'CREATE TABLE `_e_migrations` ('
                .'`Key` varchar(255) NOT NULL'
                .',`SHA1` char(40) NOT NULL'
                .',`Timestamp` timestamp NOT NULL'
                .',`Status` enum("skipped","started","failed","executed") NOT NULL'
                .',PRIMARY KEY (`Key`)'
            .')'
        );
    }


    // conveniance methods for use within migrations
    protected static function resetMigrationStatus($migrationKey)
    {
        printf("Resetting migration status for key '%s'\n", $migrationKey);

        DB::nonQuery('DELETE FROM `_e_migrations` WHERE `Key` = "%s"', $migrationKey);
    }

    protected static function tableExists($tableName)
    {
        return (boolean)DB::oneRecord('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "%s"', DB::escape($tableName));
    }

    protected static function columnExists($tableName, $columnName)
    {
        return (boolean)DB::oneRecord('SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "%s" AND COLUMN_NAME = "%s"', DB::escape([$tableName, $columnName]));
    }

    protected static function getColumns($tableName)
    {
        return DB::allRecords('SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "%s"', DB::escape($tableName));
    }

    protected static function getColumnNames($tableName)
    {
        return DB::allValues('COLUMN_NAME', 'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "%s"', DB::escape($tableName));
    }

    protected static function getColumn($tableName, $columnName)
    {
        return DB::oneRecord('SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "%s" AND COLUMN_NAME = "%s"', DB::escape([$tableName, $columnName]));
    }

    protected static function getColumnType($tableName, $columnName)
    {
        return DB::oneValue('SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "%s" AND COLUMN_NAME = "%s"', DB::escape([$tableName, $columnName]));
    }

    protected static function getColumnKey($tableName, $columnName)
    {
        return DB::oneValue('SELECT COLUMN_KEY FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "%s" AND COLUMN_NAME = "%s"', DB::escape([$tableName, $columnName]));
    }

    protected static function getColumnDefault($tableName, $columnName)
    {
        return DB::oneValue('SELECT COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "%s" AND COLUMN_NAME = "%s"', DB::escape([$tableName, $columnName]));
    }

    protected static function getColumnIsNullable($tableName, $columnName)
    {
        return 'YES' == DB::oneValue('SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "%s" AND COLUMN_NAME = "%s"', DB::escape([$tableName, $columnName]));
    }

    protected static function getConstraints($tableName)
    {
        return DB::table('CONSTRAINT_NAME', 'SELECT * FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "%s"', DB::escape($tableName));
    }

    protected static function getConstraint($tableName, $constraintName)
    {
        return DB::oneRecord('SELECT * FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "%s" AND CONSTRAINT_NAME = "%s"', DB::escape([$tableName, $constraintName]));
    }

    protected static function addColumn($tableName, $columnName, $definition, $position = null)
    {
        printf("Adding column `%s`.`%s`\n", $tableName, $columnName);

        return DB::nonQuery(
            'ALTER TABLE `%s` ADD COLUMN `%s` %s %s',
            [
                $tableName,
                $columnName,
                $definition,
                $position ?: ''
            ]
        );
    }

    protected static function addIndex($tableName, $indexName, array $columns = [], $type = null)
    {
        if (!count($columns)) {
            $columns[] = $indexName;
        }

        printf("Adding index `%s`.`%s`\n", $tableName, $indexName);

        return DB::nonQuery(
            'ALTER TABLE `%s` ADD INDEX `%s` %s (`%s`)',
            [
                $tableName,
                $indexName,
                $type ?: '',
                implode('`, `', $columns)
            ]
        );
    }

    protected static function dropColumn($tableName, $columnName)
    {
        printf("Dropping column `%s`.`%s`\n", $tableName, $columnName);

        return DB::nonQuery(
            'ALTER TABLE `%s` DROP COLUMN `%s`',
            [
                $tableName,
                $columnName
            ]
        );
    }
}