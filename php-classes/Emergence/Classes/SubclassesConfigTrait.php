<?php

namespace Emergence\Classes;

trait SubclassesConfigTrait
{
	public static $rootClass = null;
    public static $defaultClass = null;
    public static $subClasses = null;

    public static function getStaticRootClass($boundingParentClass = __CLASS__)
    {
        if (static::$rootClass) {
            return static::$rootClass;
        }

        // detect root class by crawling up the inheritence tree until an abstract parent is found
        $class = new \ReflectionClass(get_called_class());
        while ($parentClass = $class->getParentClass()) {
            
            if ($parentClass->isAbstract()) {
                return $class->getName();
            }

            $class = $parentClass;
        }
    }

    public static function getStaticDefaultClass()
    {
        if (static::$defaultClass) {
            return static::$defaultClass;
        }

        return static::getStaticRootClass();
    }

    public static function getStaticSubClasses()
    {
        if (static::$subClasses) {
            return static::$subClasses;
        }

        return array_unique([static::getStaticRootClass(), get_called_class()]);
    }


    // instance wrappers
    public function getRootClass($boundingParentClass = __CLASS__)
    {
        return static::getStaticRootClass($boundingParentClass);
    }

    public function getDefaultClass()
    {
        return static::getStaticDefaultClass();
    }

    public function getSubClasses()
    {
        return static::getStaticSubClasses();
    }
}
