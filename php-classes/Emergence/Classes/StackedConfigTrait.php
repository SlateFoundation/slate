<?php

namespace Emergence\Classes;

trait StackedConfigTrait
{
    protected static $stackedConfigs = [];

    protected static function initStackedConfig($propertyName)
    {
        $className = get_called_class();

        // merge fields from first ancestor up
        $classes = class_parents($className);
        array_unshift($classes, $className);

        $config = [];
        while ($class = array_pop($classes)) {
            $classVars = get_class_vars($class);
            if (!empty($classVars[$propertyName])) {
                $config = array_merge($config, $classVars[$propertyName]);
            }
        }

        // apply property-specific initialization
        $initMethodName = 'init'.ucfirst($propertyName);
        if (method_exists($className, $initMethodName)) {
            $config = call_user_func([$className, $initMethodName], $config);
        }

        return $config;
    }

    public static function &getStackedConfig($propertyName, $key = null)
    {
        $className = get_called_class();

        if (!isset(static::$stackedConfigs[$className][$propertyName])) {
            static::$stackedConfigs[$className][$propertyName] = static::initStackedConfig($propertyName);
        }

        if ($key) {
            if (array_key_exists($key, static::$stackedConfigs[$className][$propertyName])) {
                return static::$stackedConfigs[$className][$propertyName][$key];
            } else {
                return null;
            }
        } else {
            return static::$stackedConfigs[$className][$propertyName];
        }
    }

    public static function aggregateStackedConfig($propertyName, array $classes)
    {
        $config = [];

        foreach ($classes AS $class) {
            $config = array_merge($config, $class::getStackedConfig($propertyName));
        }

        return $config;
    }
}
