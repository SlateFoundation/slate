<?php

namespace Emergence\SiteAdmin;

use Site;
use User;
use Ifsnop\Mysqldump\Mysqldump;

class DatabaseRequestHandler extends \RequestHandler
{
    public static $excludeTables = ['sessions', '_e_files', '_e_file_collections'];

    public static $userResponseModes = [
        'application/json' => 'json'
    ];

    public static function handleRequest()
    {
        switch (static::peekPath()) {
            case 'dump.sql':
                return static::handleDumpRequest();
            default:
                return static::throwInvalidRequestError();
        }
    }

    protected static function requireDeveloperAuthentication()
    {
        global $Session;

        if ($Session && $Session->hasAccountLevel('Developer')) {
            return true;
        }

        if (
            !empty($_SERVER['PHP_AUTH_USER'])
            && !empty($_SERVER['PHP_AUTH_PW'])
            && ($User = User::getByLogin($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']))
            && $User->hasAccountLevel('Developer')
        ) {
            return true;
        }

        header('WWW-Authenticate: Basic realm="Private"');
        header('HTTP/1.0 401 Unauthorized');
        exit();
    }

    protected static function getConnectionConfig()
    {
        // load database config
        $config = Site::getConfig('database') ?: Site::getConfig('mysql');

        // build DSN string
        $dsn = 'mysql:';

        if (!empty($config['socket'])) {
            $dsn .= "unix_socket={$config['socket']}";
        } else {
            $dsn .= 'host=' . (empty($config['host']) ? 'localhost' : $config['host']);
            $dsn .= ';port=' . (empty($config['port']) ? '3306' : $config['port']);
        }

        $dsn .= ";dbname={$config['database']}";

        return [
            'dsn' => $dsn,
            'username' => $config['username'],
            'password' => $config['password']
        ];
    }

    public static function getExcludeTables()
    {
        return static::$excludeTables;
    }

    public static function handleDumpRequest()
    {
        static::requireDeveloperAuthentication();

        $connectionConfig = static::getConnectionConfig();

        // initialize dumper
        $dumper = new Mysqldump(
            $connectionConfig['dsn'],
            $connectionConfig['username'],
            $connectionConfig['password'],
            [
                'exclude-tables' => static::getExcludeTables(),
                'skip-comments' => !isset($_GET['comments']),
                'skip-definer' => !isset($_GET['definer']),
                'add-drop-table' => true
            ]
        );

        // output dump
        set_time_limit(0);
        header('Content-Type: application/sql');
        $dumper->start('php://output');
    }
}
