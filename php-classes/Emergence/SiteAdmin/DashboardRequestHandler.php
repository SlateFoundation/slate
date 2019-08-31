<?php

namespace Emergence\SiteAdmin;

use DB;
use Site;
use Person;
use User;
use Emergence\Util\ByteSize;

class DashboardRequestHandler extends \RequestHandler
{
    public static function handleRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Administrator');

        // get apc memory info
        $apcInfo = apcu_sma_info(true);

        // get available memory
        $availableMemory = null;
        $availableSwap = null;

        $memoryOutput = explode(PHP_EOL, trim(shell_exec('free -b')));
        array_shift($memoryOutput);

        foreach ($memoryOutput AS $line) {
            $line = preg_split('/\s+/', $line);

            if ($line[0] == 'Mem:') {
                $availableMemory = $line[3];
            } elseif ($line[0] == 'Swap:') {
                $availableSwap = $line[3];
            }
        }


        // render
        return static::respond('dashboard', [
            'metrics' => [
                [
                    'label' => 'Site Handle',
                    'value' => Site::getConfig('handle')
                ],
                [
                    'label' => 'Site Label',
                    'value' => Site::getConfig('label')
                ],
                [
                    'label' => 'Primary Hostname',
                    'value' => Site::getConfig('primary_hostname')
                ],
                [
                    'label' => 'Secondary Hostnames',
                    'value' => implode(', ', Site::getConfig('hostnames'))
                ],
                [
                    'label' => 'Parent Hostname',
                    'value' => Site::getConfig('parent_hostname')
                ],
                [
                    'label' => 'Parent Key',
                    'value' => Site::getConfig('parent_key')
                ],
                [
                    'label' => 'People',
                    'value' => Person::getCount(),
                    'link' => '/people'
                ],
                [
                    'label' => 'Users',
                    'value' => User::getCount(['Username IS NOT NULL']),
                    'link' => '/people?q=class:User'
                ],
                [
                    'label' => 'Administrators',
                    'value' => User::getCount(['AccountLevel' => 'Administrator']),
                    'link' => '/people?q=accountlevel:Administrator'
                ],
                [
                    'label' => 'Developers',
                    'value' => User::getCount(['AccountLevel' => 'Developer']),
                    'link' => '/people?q=accountlevel:Developer'
                ],
                [
                    'label' => 'Used App Cache',
                    'value' => ByteSize::format($apcInfo['seg_size'] - $apcInfo['avail_mem'])
                ],
                [
                    'label' => 'Available App Cache',
                    'value' => ByteSize::format($apcInfo['avail_mem'])
                ],
                [
                    'label' => 'Available Host Storage',
                    'value' => ByteSize::format(exec('df -B1 --output=avail ' . escapeshellarg(Site::$rootPath)))
                ],
                [
                    'label' => 'Available Host Memory',
                    'value' => $availableMemory ? ByteSize::format($availableMemory) : null
                ],
                [
                    'label' => 'Available Host Swap',
                    'value' => $availableSwap ? ByteSize::format($availableSwap) : null
                ],
                [
                    'label' => 'Host Load Average',
                    'value' => implode(' ', array_map(function ($n) { return number_format($n, 2); }, sys_getloadavg()))
                ],
                [
                    'label' => 'Database tables',
                    'value' => DB::oneValue(
                        '
                            SELECT COUNT(*)
                              FROM information_schema.tables
                             WHERE TABLE_SCHEMA = SCHEMA()
                               AND TABLE_NAME NOT IN ("%s")
                        ',
                        implode('","', DatabaseRequestHandler::getExcludeTables())
                    )
                ]
            ]
        ]);
    }
}