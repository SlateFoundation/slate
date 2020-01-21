<?php

return [
    'requireAccountLevel' => 'Developer',
    'title' => 'php-config',
    'description' => 'Each row represents a public static class property and its current value',
    'filename' => 'php-config',
    'headers' => [
        'class',
        'property',
        'value'
    ],
    'readQuery' => function (array $input) {
        $query = [];

        return $query;
    },
    'buildRows' => function (array $query = [], array $config = []) {

        $classNodes = Emergence_FS::findFiles('\.php$', true, 'php-classes');
        ksort($classNodes);

        foreach ($classNodes as $classNode) {
            if ($classNode->Type != 'application/php') {
                continue;
            }

            $classPath = $classNode->getFullPath(null, false);
            array_shift($classPath);
            $className = preg_replace('/(\.class)?\.php$/i', '', join('\\', $classPath));

            if (preg_match('/^(Dwoo|PHPUnit|Psr|stojg|CropFace)/', $className) || !class_exists($className)) {
                continue;
            }

            $cls = new ReflectionClass($className);
            // $defaults = $cls->getDefaultProperties();
            $props = $cls->getProperties(ReflectionProperty::IS_STATIC);

            foreach ($props as $prop) {
                if (!$prop->isPublic()) {
                    continue;
                }

                if (empty($_GET['inherited']) && $prop->class != $cls->name) {
                    continue;
                }

                $name = $prop->getName();
                $value = $prop->getValue();

                yield [
                    'class' => $className,
                    'property' => $name,
                    'value' => var_export($value, true)
                ];
            }
        }
    }
];