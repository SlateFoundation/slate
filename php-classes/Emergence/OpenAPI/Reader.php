<?php

namespace Emergence\OpenAPI;

use Exception;
use ActiveRecord;
use VersionedRecord;
use Emergence\Util\Data AS DataUtil;


class Reader
{
    public static $pathObjectProperties = [
        'x-recordsRequestHandler',
        'get',
        'put',
        'post',
        'delete',
        'options',
        'head',
        'patch',
        'parameters'
    ];

    public static $schemaObjectProperties = [
        'x-activeRecord',
        '$ref',
        'properties',
        'description',
        'type'
    ];


    public static function readTree(array $base = [], $root = 'api-docs')
    {
        $data = DataUtil::mergeFileTree($root, $base);


        // collapse and normalize paths
        $data['paths'] = static::findObjects(
            $data['paths'],
            [__CLASS__, 'isPathObject'],
            function (array $keys) {
                return '/' . implode('/', array_map(function ($key) {
                    return trim($key, '/');
                }, $keys));
            }
        );

        $data['paths'] = array_map([__CLASS__, 'normalizePathObject'], $data['paths']);
        ksort($data['paths']);


        // collapse and normalize definitions
        $data['definitions'] = static::findObjects(
            $data['definitions'],
            [__CLASS__, 'isSchemaObject'],
            function (array $keys) {
                return implode('\\', $keys);
            }
        );

        $data['definitions'] = array_map([__CLASS__, 'normalizeSchemaObject'], $data['definitions']);
        ksort($data['definitions']);


        return $data;
    }

    protected static function findObjects(array $array, $sniffer, $keyMaker, array $previousKeys = [])
    {
        $results = [];

        foreach ($array AS $key => $value) {
            if (!is_array($value)) {
                continue;
            }

            $keys = array_merge($previousKeys, [$key]);

            if (call_user_func($sniffer, $value)) {
                $results[call_user_func($keyMaker, $keys)] = $value;
            } else {
                $results = array_merge($results, static::findObjects($value, $sniffer, $keyMaker, $keys));
            }
        }

        return $results;
    }

    protected static function isPathObject(array $object)
    {
        foreach (static::$pathObjectProperties AS $key) {
            if (array_key_exists($key, $object)) {
                return true;
            }
        }

        return false;
    }

    protected static function isSchemaObject(array $object)
    {
        foreach (static::$schemaObjectProperties AS $key) {
            if (array_key_exists($key, $object)) {
                return true;
            }
        }

        return false;
    }

    protected static function normalizePathObject(array $object)
    {
        // TODO: generate path and sub-path spec if x-recordsRequestHandler is set
        return $object;
    }

    protected static function normalizeSchemaObject(array $object)
    {
        if (!empty($object['x-activeRecord'])) {
            if (!class_exists($object['x-activeRecord']) || !is_a($object['x-activeRecord'], ActiveRecord::class, true)) {
                throw new Exception('x-activeRecord value does not match an available ActiveRecord class: ' . $object['x-activeRecord']);
            }

            $required = [];

            foreach ($object['x-activeRecord']::aggregateStackedConfig('fields') AS $fieldName => $fieldConfig) {
                if ($fieldName == 'RevisionID' && is_a($object['x-activeRecord'], VersionedRecord::class, true)) {
                    continue;
                }

                if ($fieldConfig['notnull'] && !isset($fieldConfig['default']) && !$fieldConfig['autoincrement']) {
                    $required[] = $fieldName;
                }

                $propertyDefaults = [
                    'title' => $fieldConfig['label']
                ];

                if (!empty($fieldConfig['description'])) {
                    $propertyDefaults['description'] = $fieldConfig['description'];
                }

                if (isset($fieldConfig['default'])) {
                    $propertyDefaults['default'] = $fieldConfig['default'];
                }

                switch ($fieldConfig['type']) {
                    case 'int':
                    case 'uint':
                    case 'integer':
                    case 'tinyint':
                    case 'smallint':
                    case 'mediumint':
                    case 'year':
                        $propertyDefaults['type'] = 'number';
                        break;

                    case 'bigint':
                        $propertyDefaults['type'] = 'number';
                        $propertyDefaults['format'] = 'int64';
                        break;

                    case 'float':
                    case 'decimal':
                        $propertyDefaults['type'] = 'number';
                        $propertyDefaults['format'] = 'float';
                        break;

                    case 'double':
                        $propertyDefaults['type'] = 'number';
                        $propertyDefaults['format'] = 'double';
                        break;

                    case 'enum':
                        $propertyDefaults['enum'] = $fieldConfig['values'];
                        // fall through to string type
                    case 'set':
                    case 'string':
                    case 'clob':
                    case 'serialized':
                    case 'json':
                    case 'list':
                        $propertyDefaults['type'] = 'string';
                        break;

                    case 'password':
                        $propertyDefaults['type'] = 'string';
                        $propertyDefaults['format'] = 'password';
                        break;

                    case 'blob':
                        $propertyDefaults['type'] = 'string';
                        $propertyDefaults['format'] = 'binary';
                        break;

                    case 'boolean':
                        $propertyDefaults['type'] = 'boolean';
                        break;

                    case 'timestamp':
                        $propertyDefaults['type'] = 'string';
                        $propertyDefaults['format'] = 'date-time';

                        if ($propertyDefaults['default'] == 'CURRENT_TIMESTAMP') {
                            unset($propertyDefaults['default']);

                            $description = 'Defaults to current timestamp.';
                            $propertyDefaults['description'] = !empty($propertyDefaults['description']) ? $propertyDefaults['description'] . "\n\n" . $description : $description;
                        }
                        break;

                    case 'date':
                        $propertyDefaults['type'] = 'string';
                        $propertyDefaults['format'] = 'date';
                        break;
                }

                $object['properties'][$fieldName] = isset($object['properties'][$fieldName]) ? array_merge($propertyDefaults, $object['properties'][$fieldName]) : $propertyDefaults;
            }

            if (count($required)) {
                $object['required'] = isset($object['required']) ? array_unique(array_merge($object['required'], $required)) : $required;
            }
        }

        return $object;
    }

    public static function dereferenceNode(array $node, array $document)
    {
        if (empty($node['$ref'])) {
            return $node;
        }

        $path = $node['$ref'];

        if ($path[0] != '#') {
            throw new Exception('Resolving remote reference is not implemented');
        }

        if ($path[1] != '/') {
            throw new Exception('Resolving relative reference is not implemented');
        }

        $pathStack = explode('/', substr($path, 2));
        $pointer = &$document;

        while (isset($pathStack[0]) && isset($pointer)) {
            $pointer = $pointer[array_shift($pathStack)];
        }

        if (is_array($pointer)) {
            $pointer['_resolvedRef'] = $path;
        }

        return $pointer;
    }

    public static function flattenDefinition(array $schema, array $document)
    {
        $schema = static::dereferenceNode($schema, $document);

        if (!empty($schema['schema'])) {
            return static::flattenDefinition($schema['schema'], $document);
        }

        if (!empty($schema['allOf'])) {
            $aggregate = [
                'properties' => [],
                'required' => []
            ];

            $definitions = array_map(function($definition) use ($document) {
                return static::dereferenceNode($definition, $document);
            }, $schema['allOf']);

            foreach ($definitions AS $definition) {
                foreach ($definition['required'] AS $required) {
                    if (!in_array($required, $aggregate['required'])) {
                        $aggregate['required'][] = $required;
                    }
                }
                unset($definition['required']);

                foreach ($definition['properties'] AS $property => $propertyData) {
                    $aggregate['properties'][$property] = $propertyData;
                }
                unset($definition['properties']);

                unset($definition['_resolvedRef']);
                $aggregate = array_merge($aggregate, $definition);
            }

            return $aggregate;
        }

        return $schema;
    }

    public static function getDefinitionIdFromPath($path)
    {
        if ($path) {
            $prefix = '#/definitions/';
            $prefixLen = strlen($prefix);

            if (substr($path, 0, $prefixLen) === $prefix) {
                return substr($path, $prefixLen);
            }
        }

        return null;
    }
}