<?php

namespace Emergence\DAV;

class ParentCollection extends RootCollection
{
    public static $handle;
    protected static $_children;

    public function __construct($handle)
    {
        static::$handle = $handle;
    }

    public function __get($name)
    {
        switch ($name) {
            case 'Class':
                return '\Emergence\DAV\RootCollection';

            case 'Handle':
                return static::getName();

            case 'FullPath':
                return static::$handle;
        }
    }

    public function getChildren()
    {
        if (!isset(static::$_children)) {
            $results = \DB::query(
                'SELECT * FROM `%s` WHERE Site = "Remote" AND ParentID IS NULL', [
                    Collection::$tableName,
                ]
            );

            static::$_children = [];
            while ($record = $results->fetch_assoc()) {
                static::$_children[$record['Handle']] = new Collection($record['Handle'], $record);
            }
        }

        return static::$_children;
    }

    public function resolvePath($path)
    {
        if (!is_array($path)) {
            $path = \Site::splitPath($path);
        }

        $node = $this;
        while ($childHandle = array_shift($path)) {
            if (method_exists($node, 'getChild') && $nextNode = $node->getChild($childHandle)) {
                $node = $nextNode;
            } else {
                $node = false;

                break;
            }
        }

        return $node;
    }

    public function getChild($name)
    {
        // filter name
        $name = static::filterName($name);

        // get children
        if (!isset(static::$_children)) {
            $this->getChildren();
        }

        if (empty(static::$_children[$name])) {
            throw new \Sabre\DAV\Exception\FileNotFound('The collection with name: '.$name.' could not be found');
        }

        // check if name is an alias
        return static::$_children[$name];
    }

    public function childExists($name)
    {
        // filter name
        $name = static::filterName($name);

        // get children
        if (!isset(static::$_children)) {
            $this->getChildren();
        }

        return array_key_exists($name, static::$_children);
    }

    public function getName()
    {
        if ($parentHostname = \Site::getConfig('parent_hostname')) {
            return static::$handle.' ('.$parentHostname.')';
        } else {
            return false;
        }
    }

    public function getData()
    {
        return [
            'Class' => 'SiteCollection', 'Handle' => $this->getName(), 'FullPath' => static::$handle,
        ];
    }
}
