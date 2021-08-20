<?php

namespace Emergence\SiteAdmin;

use DB;
use Site;
use Debug;
use Emergence_FS;
use OutOfBoundsException;
use RangeException;
use TableNotFoundException;
use QueryException;


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

        if (static::peekPath() == '!refresh') {
            return static::handleRefreshRequest();
        } elseif (static::peekPath() == '!all') {
            return static::handleAllMigrationsRequest();
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

    public static function handleAllMigrationsRequest()
    {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return static::respond('confirm', [
                'question' => 'Are you sure you want to execute all new migrations?'
            ]);
        }

        $migrations = [];
        foreach (static::getMigrations() as $migration) {
            if ($migration['status'] != static::STATUS_NEW) {
                continue;
            }

            $migrations []= static::executeMigration($migration);
        }

        return static::respond('allMigrationsExecuted', [
            'migrations' => $migrations
        ]);
    }

    public static function handleMigrationRequest($migrationKey)
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            try {
                $migration = static::executeMigration($migrationKey, !empty($_REQUEST['force']));
            } catch (OutOfBoundsException $e) {
                return static::throwNotFoundError($e->getMessage());
            } catch (RangeException $e) {
                return static::throwInvalidRequestError($e->getMessage());
            }

            return static::respond('migrationExecuted', [
                'migration' => $migration
            ]);
        }

        $migration = static::getMigrationData($migrationKey);

        if (!$migration) {
            return static::throwNotFoundError("Migration not found: {$migrationKey}");
        }

        return static::respond('migration', [
            'migration' => $migration
        ]);
    }

    public static function getMigrationNode($migrationKey)
    {
        return Site::resolvePath("php-migrations/{$migrationKey}.php");
    }

    public static function getMigrationData($migrationKey, array $migrationRecord = null)
    {
        $migrationNode = static::getMigrationNode($migrationKey);

        if (!$migrationNode) {
            return null;
        }

        if (!$migrationRecord) {
            try {
                $migrationRecord = DB::oneRecord('SELECT * FROM _e_migrations WHERE `Key` = "%s"', DB::escape($migrationKey));
            } catch (TableNotFoundException $e) {
                $migrationRecord = null;
            }
        }

        preg_match('#^(\d{8})(\d*)#', basename($migrationKey), $keyMatches);

        return [
            'key' => $migrationKey,
            'path' => $migrationNode->FullPath,
            'realpath' => $migrationNode->RealPath,
            'status' => $migrationRecord ? $migrationRecord['Status'] : static::STATUS_NEW,
            'executed' => $migrationRecord ? $migrationRecord['Timestamp'] : null,
            'sha1' => $migrationNode->SHA1,
            'output' => $migrationRecord ? $migrationRecord['Output'] : null,
            'sequence' => $keyMatches && $keyMatches[1] ? (int)$keyMatches[1] : 0,
            'sequenceTime' => $keyMatches && $keyMatches[2] ? (int)$keyMatches[2] : 0
        ];
    }

    public static function executeMigration($migration, $force = false)
    {
        if (is_string($migration)) {
            $migrationKey = $migration;
            $migration = static::getMigrationData($migrationKey);

            if (!$migration) {
                throw new OutOfBoundsException("Migration not found: {$migrationKey}");
            }
        }

        if (!$force && $migration['status'] != static::STATUS_NEW) {
            throw new RangeException('Cannot execute requested migration, it has already been skipped, started, or executed');
        }

        $insertSql = sprintf(
            '
                INSERT INTO `_e_migrations`
                   SET `Key` = "%1$s",
                       SHA1 = "%2$s",
                       Timestamp = FROM_UNIXTIME(%3$u),
                       Status = "%4$s"
                    ON DUPLICATE KEY UPDATE
                       SHA1 = "%2$s",
                       Timestamp = FROM_UNIXTIME(%3$u),
                       Status = "%4$s"
            ',
            $migration['key'],
            $migration['sha1'],
            time(),
            static::STATUS_STARTED
        );

        try {
            DB::nonQuery($insertSql);
        } catch (TableNotFoundException $e) {
            static::createMigrationsTable();
            DB::nonQuery($insertSql);
        }

        Site::$debug = true;
        $debugLogStartIndex = count(Debug::$log);


        $resetMigrationStatus = function() use ($migration) {
            static::resetMigrationStatus($migration['key']);
        };

        ob_start();
        try {
            $migration['status'] = call_user_func(function() use ($migration, $resetMigrationStatus) {
                return include($migration['realpath']);
            });
        } catch (\Exception $e) {
            $migration['status'] = static::STATUS_FAILED;
            printf('Caught %s: %s\n\n%s\n\n', get_class($e), $e->getMessage(), $e->getTraceAsString());
        }
        $migration['output'] = ob_get_clean();

        $migration['executed'] = time();

        if ($migration['status'] == static::STATUS_DEBUG) {
            static::resetMigrationStatus($migration['key']);
        } else {
            if (!in_array($migration['status'], [static::STATUS_SKIPPED, static::STATUS_EXECUTED])) {
                $migration['status'] = static::STATUS_FAILED;
            }

            $upgraded = false;
            do {
                try {
                    DB::nonQuery(
                        'UPDATE `_e_migrations` SET Timestamp = FROM_UNIXTIME(%u), Status = "%s", Output = "%s" WHERE `Key` = "%s"',
                        [
                            $migration['executed'],
                            $migration['status'],
                            DB::escape($migration['output']),
                            $migration['key'],
                        ]
                    );
                    break;
                } catch (QueryException $e) {
                    if ($upgraded) {
                        throw $e;
                    }

                    static::upgradeMigrationsTable();
                    $upgraded = true;
                }
            } while (true);
        }

        $migration['queryLog'] = array_filter(
            array_slice(Debug::$log, $debugLogStartIndex),
            function ($entry) {
                return !empty($entry['query']);
            }
        );

        return $migration;
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
            $migrations[$migrationKey] = static::getMigrationData($migrationKey, $migrationRecord);
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
                .',`Output` TEXT NULL DEFAULT NULL'
                .',PRIMARY KEY (`Key`)'
            .')'
        );
    }

    protected static function upgradeMigrationsTable()
    {
        if (!static::columnExists('_e_migrations', 'Output')) {
            return DB::nonQuery('ALTER TABLE `_e_migrations` ADD COLUMN `Output` TEXT NULL DEFAULT NULL AFTER Status');
        }
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

    protected static function getColumnEnumValues($tableName, $columnName)
    {
        $columnType = static::getColumnType($tableName, $columnName);

        if (substr($columnType, 0, 5) != 'enum(') {
            throw new RangeException("Column {$tableName}.{$columnName} is not enum");
        }

        return array_map(function ($value) {
            return str_replace(['\\\\', '\'\''], ['\\', '\''], $value);
        }, explode("','", substr($columnType, 6, -2)));
    }

    protected static function hasColumnEnumValue($tableName, $columnName, $value)
    {
        return in_array($value, static::getColumnEnumValues($tableName, $columnName));
    }

    protected static function addColumnEnumValue($tableName, $columnName, $value)
    {
        $column = static::getColumn($tableName, $columnName);

        if (substr($column['COLUMN_TYPE'], 0, 5) != 'enum(') {
            throw new RangeException("Column {$tableName}.{$columnName} is not enum");
        }

        $escapedValue = str_replace(['\\', '\''], ['\\\\', '\'\''], $value);
        $definition = 'enum(' . substr($column['COLUMN_TYPE'], 5, -1) . ",'{$escapedValue}')";

        $definition .= $column['IS_NULLABLE'] == 'YES'
            ? ' NULL'
            : ' NOT NULL';

        if ($column['COLUMN_DEFAULT'] !== null || $column['IS_NULLABLE'] == 'YES') {
            $definition .= $column['COLUMN_DEFAULT'] === null
                ? ' DEFAULT NULL'
                : ' DEFAULT "'.DB::escape($column['COLUMN_DEFAULT']).'"';
        }

        printf("Adding value '%s' to enum column `%s`.`%s`\n", $escapedValue, $tableName, $columnName);

        return DB::nonQuery(
            'ALTER TABLE `%1$s` CHANGE `%2$s` `%2$s` %3$s',
            [
                $tableName,
                $columnName,
                $definition
            ]
        );
    }

    protected static function removeColumnEnumValue($tableName, $columnName, $value)
    {
        $column = static::getColumn($tableName, $columnName);

        if (substr($column['COLUMN_TYPE'], 0, 5) != 'enum(') {
            throw new RangeException("Column {$tableName}.{$columnName} is not enum");
        }

        $escapedValue = str_replace(['\\', '\''], ['\\\\', '\'\''], $value);

        // extract values list
        $values = substr($column['COLUMN_TYPE'], 5, -1);

        // remove quoted value
        $values = preg_replace('/(?<=^|,)\''.preg_quote($escapedValue).'\'(?=,|$)/', '', $values);

        // trim leftover commas
        $values = trim($values, ',');
        $values = str_replace("',,'", "','", $values);

        // build field definition
        $definition = 'enum('.$values.')';

        $definition .= $column['IS_NULLABLE'] == 'YES'
            ? ' NULL'
            : ' NOT NULL';

        $definition .= $column['COLUMN_DEFAULT'] === null
            ? ' DEFAULT NULL'
            : ' DEFAULT "'.DB::escape($column['COLUMN_DEFAULT']).'"';

        printf("Removing value '%s' from enum column `%s`.`%s`\n", $escapedValue, $tableName, $columnName);

        return DB::nonQuery(
            'ALTER TABLE `%1$s` CHANGE `%2$s` `%2$s` %3$s',
            [
                $tableName,
                $columnName,
                $definition
            ]
        );
    }

    protected static function replaceColumnEnumValue($tableName, $columnName, $oldValue, $newValue)
    {
        static::addColumnEnumValue($tableName, $columnName, $newValue);

        printf("Replacing value '%s' with value '%s' in enum column `%s`.`%s`\n", $oldValue, $newValue, $tableName, $columnName);
        DB::nonQuery(
            'UPDATE `%1$s` SET `%2$s` = "%3$s" WHERE `%2$s` = "%4$s"',
            [
                $tableName,
                $columnName,
                $newValue,
                $oldValue
            ]
        );

        static::removeColumnEnumValue($tableName, $columnName, $oldValue);
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