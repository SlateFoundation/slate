<?php

namespace Emergence\DAV;

class RootCollection extends \Sabre\DAV\Collection
{
    public static $allowCreateRootCollections = true;

    public static $siteDirectories = [
        '_parent' => '\Emergence\DAV\ParentCollection',
    ];

    public function getChildren()
    {
        $children = [];

        // static directories
        foreach (static::$siteDirectories as $name => $class) {
            $instance = $this->getChild($name);

            if ($instance->getName()) {
                $children[] = $instance;
            }
        }

        // merge with root virtual collections
        return array_merge($children, Collection::getAllRootCollections());
    }

    public function createDirectory($name)
    {
        if (static::$allowCreateRootCollections) {
            return Collection::getOrCreateRootCollection($name);
        } else {
            throw new \Sabre\DAV\Exception\Forbidden('Creating root collections is not permitted on this site');
        }
    }

    public function getChild($name)
    {
        // filter name
        $name = static::filterName($name);

        // check if child exists
        if (array_key_exists($name, static::$siteDirectories)) {
            $className = static::$siteDirectories[$name];

            return new $className($name);
        } elseif ($collection = Collection::getByHandle($name)) {
            return $collection;
        }

        throw new \Sabre\DAV\Exception\FileNotFound('The file with name: '.$name.' could not be found');
    }

    public function childExists($name)
    {
        // filter name
        $name = static::filterName($name);

        return (bool) $this->getChild($name);
    }

    public function getName()
    {
        return basename(realpath('../')).' ('.$_SERVER['HTTP_HOST'].')';
    }

    public static function filterName($name)
    {
        return preg_replace('/\s*\([^)]*\)$/', '', $name);
    }
}
