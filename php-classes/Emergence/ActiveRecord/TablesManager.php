<?php

namespace Emergence\ActiveRecord;

use Emergence_FS;


class TablesManager
{
    public static $classFilters = [
        '/^(Dwoo|Sabre|PHPUnit)[\\\\_]/',
        '/(Trait|Interface|Test)$/'
    ];

    /**
     * Load class filters from legacy table manager for backwards compatibility
     */
    public static function __classLoaded()
    {
        if (class_exists('\TableManagerRequestHandler')) {
            self::$classFilters = array_unique(array_merge(self::$classFilters, \TableManagerRequestHandler::$classFilters));
        }
    }

    public static function getActiveRecordClasses()
    {
        $recordClasses = array();

        foreach (Emergence_FS::findFiles('\.php$', true, 'php-classes') AS $classNode) {
            if ($classNode->Type != 'application/php') {
                continue;
            }

            $classPath = $classNode->getFullPath(null, false);
            array_shift($classPath);

            $className = preg_replace('/(\.class)?\.php$/i', '', join('\\', $classPath));

            foreach (static::$classFilters AS $pattern) {
                if (preg_match($pattern, $className)) {
                    continue 2;
                }
            }

            if (is_subclass_of($className, 'ActiveRecord') && !in_array($className, $recordClasses)) {
                $recordClasses[] = $className;
            }
        }

        natsort($recordClasses);

        return $recordClasses;
    }
}