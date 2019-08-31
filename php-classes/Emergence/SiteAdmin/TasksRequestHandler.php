<?php

namespace Emergence\SiteAdmin;

use Site;
use SiteFile;
use Emergence_FS;
use RequestHandler;
use Emergence\Dwoo\Engine AS DwooEngine;

use Exception;


class TasksRequestHandler extends RequestHandler
{
    public static $taskDefaults = [
        'requireAccountLevel' => 'Developer',
        'icon' => 'wrench'
    ];

    public static $userResponseModes = [
        'application/json' => 'json'
    ];


    public static function handleRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Administrator');

        $taskPath = array_filter(static::getPath());

        if (count($taskPath)) {
            return static::handleTaskRequest($taskPath);
        }

        $tasks = [];
        $rootCollection = 'site-tasks';
        $prefixLength = strlen($rootCollection) + 1;

        Emergence_FS::cacheTree($rootCollection);
        $taskNodes = Emergence_FS::getTreeFiles($rootCollection);

        foreach ($taskNodes AS $taskNodePath => $taskNode) {
            $taskPath = substr($taskNodePath, $prefixLength, -4);

            $taskConfig = include(SiteFile::getRealPathByID($taskNode['ID']));

            if (!is_array($taskConfig)) {
                throw new \Exception("Task $taskPath does not return array");
            }

            $taskConfig = array_merge(static::$taskDefaults, $taskConfig);
            
            if (!empty($taskConfig['requireAccountLevel']) && (empty($GLOBALS['Session']) || !$GLOBALS['Session']->hasAccountLevel($taskConfig['requireAccountLevel']))) {
                continue;
            }

            $tasks[$taskPath] = $taskConfig;
        }

        ksort($tasks);

        return static::respond('tasks', [
            'tasks' => $tasks
        ]);
    }

    public static function handleTaskRequest(array $taskPath)
    {
        $pathStack = $taskPath;
        $path = [array_shift($pathStack)];

        do {
            $taskPath = implode('/', $path);
            $taskNode = Site::resolvePath("site-tasks/$taskPath.php");
        } while (!$taskNode && ($path[] = array_shift($pathStack)));

        if (!$taskNode) {
            return static::throwNotFoundError('task not found');
        }

        $taskConfig = include($taskNode->RealPath);
        $taskConfig = array_merge(static::$taskDefaults, $taskConfig);
        $taskConfig['path'] = $taskPath;
        $taskConfig['pathStack'] = $pathStack;
        $taskConfig['baseUrl'] = '/site-admin/tasks/'.$taskPath;

        if (!empty($taskConfig['requireAccountLevel']) && (empty($GLOBALS['Session']) || !$GLOBALS['Session']->hasAccountLevel($taskConfig['requireAccountLevel']))) {
            return static::throwUnauthorizedError("You must have account level $taskConfig[requireAccountLevel] to access this task");
        }

        if (empty($taskConfig['handler'])) {
            throw new Exception("Task $taskPath does not have a handler configured");
        }

        // export task as global for templates
        DwooEngine::getInstance()->globals['task'] = $taskConfig;

        if (is_callable($taskConfig['handler'])) {
            call_user_func($taskConfig['handler'], $taskConfig);
        } elseif (is_a($taskConfig['handler'], RequestHandler::class, true)) {
            $taskConfig['handler']::setPath($pathStack);
            $taskConfig['handler']::handleRequest();
        } else {
            throw new Exception("Task $taskPath has a handler configured that can't be invoked");
        }

#        \Debug::dumpVar($taskData, true, 'handling task');
    }
}