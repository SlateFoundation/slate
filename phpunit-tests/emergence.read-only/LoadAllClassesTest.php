<?php

class LoadAllClassesTest extends PHPUnit_Framework_TestCase
{
    public function testLoad()
    {
        foreach (Emergence_FS::findFiles('\.php$', true, 'php-classes') AS $classNode) {
            if ($classNode->Type != 'application/php') {
                continue;
            }

            $classPath = $classNode->getFullPath(null, false);
            array_shift($classPath);
            $className = preg_replace('/(\.class)?\.php$/i', '', join('\\', $classPath));

            if (!$this->classLoaded($className)) {
                \Site::loadClass($className);
            }

            $this->assertTrue($this->classLoaded($className), "Class/interface $className exists");
        }
    }

    protected function classLoaded($className)
    {
        $legacyClassName = str_replace('\\', '_', $className);

        return (
            class_exists($className, false)
            || interface_exists($className, false)
            || trait_exists($className, false)
            || class_exists($legacyClassName, false)
            || interface_exists($legacyClassName, false)
            || trait_exists($legacyClassName, false)
        );
    }
}