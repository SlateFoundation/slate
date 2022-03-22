<?php

namespace Emergence\OpenAPI;

use Exception;
use ActiveRecord;
use VersionedRecord;
use RecordsRequestHandler;
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

    public static $parameterObjectProperties = [
        'name',
        'in'
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

        foreach ($data['paths'] as $pathKey => &$pathObject) {
            $outSubPaths = [];
            $outDefinitions = [];
            $pathObject = static::normalizePathObject($pathObject, $outSubPaths, $outDefinitions);

            foreach ($outSubPaths as $subPathKey => $subPathObject) {
                $data['paths']["{$pathKey}/{$subPathKey}"] = static::normalizePathObject($subPathObject);
            }

            foreach ($outDefinitions as $definitionKey => $definitionObject) {
                // will be normalized in next loop
                $data['components']['schemas'][$definitionKey] = $definitionObject;
            }
        }
        ksort($data['paths']);


        // collapse and normalize definitions
        $data['components']['schemas'] = static::findObjects(
            $data['components']['schemas'],
            [__CLASS__, 'isSchemaObject'],
            function (array $keys) {
                return implode('-', $keys);
            }
        );

        $data['components']['schemas'] = array_map([__CLASS__, 'normalizeSchemaObject'], $data['components']['schemas']);
        ksort($data['components']['schemas']);


        // collapse and normalize parameters
        $data['components']['parameters'] = static::findObjects(
            $data['components']['parameters'],
            [__CLASS__, 'isParameterObject'],
            function (array $keys) {
                return implode('-', $keys);
            }
        );

        ksort($data['components']['parameters']);


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

    protected static function isParameterObject(array $object)
    {
        foreach (static::$parameterObjectProperties AS $key) {
            if (array_key_exists($key, $object)) {
                return true;
            }
        }

        return false;
    }

    protected static function normalizePathObject(array $object, array &$outSubPaths = null, array &$outDefinitions = null)
    {
        if (!empty($object['x-recordsRequestHandler'])) {
            if (!isset($outSubPaths)) {
                throw new Exception('x-recordsRequestHandler value cannot be processed within a generated subpath');
            }

            if (!class_exists($object['x-recordsRequestHandler'])) {
                throw new Exception('x-recordsRequestHandler value does not match an available class: ' . $object['x-recordsRequestHandler']);
            }

            if (!is_a($object['x-recordsRequestHandler'], RecordsRequestHandler::class, true)) {
                throw new Exception('x-recordsRequestHandler value is not an RecordsRequestHandler subclass: ' . $object['x-recordsRequestHandler']);
            }

            static::fillPathsFromRecordsRequestHandler($object['x-recordsRequestHandler'], $object, $outSubPaths, $outDefinitions);

            unset($object['x-recordsRequestHandler']);
        }

        return $object;
    }

    protected static function fillPathsFromRecordsRequestHandler($className, &$outPath, array &$outSubPaths, array &$outDefinitions)
    {
        $recordClass = $className::$recordClass;
        $recordNoun = $recordClass::$singularNoun;

        // generate record definition
        $recordDefinitionName = str_replace('\\', '-', $recordClass::getRootClass());

        $recordDefinition = [];
        static::fillSchemaFromActiveRecord($recordClass, $recordDefinition);
        $outDefinitions[$recordDefinitionName] = $recordDefinition;

        // generate response definition
        $outDefinitions["{$recordDefinitionName}Response"] = [
            'type' => 'object',
            'required' => [ 'data', 'success' ],
            'properties' => [
                'success' => [
                    'type' => 'boolean'
                ],
                'data' => [
                    'type' => 'array',
                    'items' => [ '$ref' => "#/components/schemas/{$recordDefinitionName}" ]
                ],
                'limit' => [
                    'type' => 'integer',
                    'description' => 'Number of records response was limited to'
                ],
                'offset' => [
                    'type' => 'integer',
                    'description' => 'Position of first record returned in full result set'
                ],
                'total' => [
                    'type' => 'integer',
                    'description' => 'The total number of records available in the result set across all pages'
                ],
                'conditions' => [
                    'type' => 'object',
                    'description' => 'SQL filters applied to current result set '
                ]
            ]
        ];

        // GET /records
        $outPath['get'] = array_merge_recursive(
            [
                'tags' => [ $recordClass ],
                'summary' => "Get list of `{$recordClass}` record instances",
                'parameters' => [
                    [ '$ref' => '#/components/parameters/limit' ],
                    [ '$ref' => '#/components/parameters/offset' ],
                    [ '$ref' => '#/components/parameters/query' ],
                    [ '$ref' => '#/components/parameters/include' ],
                    [ '$ref' => '#/components/parameters/relatedTable' ],
                    [ '$ref' => '#/components/parameters/sort' ],
                    [ '$ref' => '#/components/parameters/dir' ],
                    [ '$ref' => '#/components/parameters/format' ],
                    [ '$ref' => '#/components/parameters/accept' ]
                ],
                'responses' => [
                    '200' => [
                        'description' => 'Successful response',
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    '$ref' => "#/components/schemas/{$recordDefinitionName}Response"
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            $outPath['get'] ?: []
        );

        // GET /records/*fields
        $outSubPaths['*fields'] = array_merge_recursive(
            [
                'get' => [
                    'tags' => [ $recordClass ],
                    'summary' => "Get configuration of all available `{$recordClass}` fields",
                    'parameters' => [
                        [ '$ref' => '#/components/parameters/format' ],
                        [ '$ref' => '#/components/parameters/accept' ]
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Successful response',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'fields' => [
                                                'type' => 'object',
                                                'description' => 'All available fields and their configurations'
                                            ],
                                            'dynamicFields' => [
                                                'type' => 'object',
                                                'description' => 'All available dynamic fields and their configurations'
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            $outSubPaths['*fields'] ?: []
        );

        // POST /records/save
        $outSubPaths['save'] = array_merge_recursive(
            [
                'post' => [
                    'tags' => [ $recordClass ],
                    'summary' => "Create or update one or more `{$recordClass}` records",
                    'parameters' => [
                        [ '$ref' => '#/components/parameters/include' ],
                        [ '$ref' => '#/components/parameters/format' ],
                        [ '$ref' => '#/components/parameters/accept' ]
                    ],
                    'requestBody' => [
                        'description' => "Values for new `{$recordClass}` record fields",
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'properties' => [
                                        'data' => [
                                            'type' => 'array',
                                            'description' => 'An array of records to patch or create. Each object may omit fields to leave unchanged or use default values. Objects containing an `ID` value will patch the existing record, others will create new records.',
                                            'items' => [
                                                '$ref' => "#/components/schemas/{$recordDefinitionName}"
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Successful response',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'success' => [
                                                'type' => 'boolean'
                                            ],
                                            'data' => [
                                                'type' => 'array',
                                                'description' => 'A list of successfully saved records',
                                                'items' => [
                                                    '$ref' => "#/components/schemas/{$recordDefinitionName}"
                                                ]
                                            ],
                                            'failed' => [
                                                'type' => 'array',
                                                'description' => 'A list of record data objects that failed to save',
                                                'items' => [
                                                    'type' => 'object',
                                                    'properties' => [
                                                        'record' => [
                                                            '$ref' => "#/components/schemas/{$recordDefinitionName}"
                                                        ],
                                                        'validationErrors' => [
                                                            'type' => 'object',
                                                            'description' => 'All validation errors from trying to save the associated record, keyed by field name'
                                                        ]
                                                    ]
                                                ]
                                            ],
                                            'message' => [
                                                'type' => 'string',
                                                'description' => 'Top line error message if save failed'
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            $outSubPaths['save'] ?: []
        );

        // POST /records/destroy
        $outSubPaths['destroy'] = array_merge_recursive(
            [
                'post' => [
                    'tags' => [ $recordClass ],
                    'summary' => "Destroy one or more `{$recordClass}` record",
                    'requestBody' => [
                        'description' => "List of IDs of `{$recordNoun}` records to delete",
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'properties' => [
                                        'data' => [
                                            'type' => 'array',
                                            'items' => [
                                                'type' => 'object',
                                                'properties' => [
                                                    'ID' => [
                                                        'type' => 'integer',
                                                        'description' => 'Could also me an object containing the property `ID`'
                                                    ]
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Successful response',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'success' => [
                                                'type' => 'boolean'
                                            ],
                                            'data' => [
                                                '$ref' => "#/components/schemas/{$recordDefinitionName}"
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            $outSubPaths['destroy'] ?: []
        );

        // GET or POST /records/create
        $outSubPaths['create'] = array_merge_recursive(
            [
                'get' => [
                    'tags' => [ $recordClass ],
                    'summary' => "Get form/data needed to create a `{$recordClass}` record",
                    'parameters' => [
                        [ '$ref' => '#/components/parameters/include' ],
                        [ '$ref' => '#/components/parameters/format' ],
                        [ '$ref' => '#/components/parameters/accept' ]
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Successful response',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'success' => [
                                                'type' => 'boolean'
                                            ],
                                            'data' => [
                                                'type' => 'array',
                                                'items' => [
                                                    '$ref' => "#/components/schemas/{$recordDefinitionName}"
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],
                'post' => [
                    'tags' => [ $recordClass ],
                    'summary' => "Create a new `{$recordClass}` record",
                    'parameters' => [
                        [ '$ref' => '#/components/parameters/include' ],
                        [ '$ref' => '#/components/parameters/format' ],
                        [ '$ref' => '#/components/parameters/accept' ]
                    ],
                    'requestBody' => [
                        'description' => "Values for new `{$recordClass}` record fields",
                        'required' => true,
                        'content' => [
                            'application/x-www-form-urlencoded' => [
                                'schema' => [ '$ref' => "#/components/schemas/{$recordDefinitionName}" ]
                            ]
                        ]
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Successful response',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'success' => [
                                                'type' => 'boolean'
                                            ],
                                            'data' => [
                                                '$ref' => "#/components/schemas/{$recordDefinitionName}"
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            $outSubPaths['create'] ?: []
        );

        // GET /records/{identifier}
        $outSubPaths['{identifier}'] = array_merge_recursive(
            [
                'get' => [
                    'tags' => [ $recordClass ],
                    'summary' => "Get an individual `{$recordClass}` record",
                    'parameters' => [
                        [ '$ref' => '#/components/parameters/identifier' ],
                        [ '$ref' => '#/components/parameters/include' ],
                        [ '$ref' => '#/components/parameters/format' ],
                        [ '$ref' => '#/components/parameters/accept' ]
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Successful response',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'success' => [
                                                'type' => 'boolean'
                                            ],
                                            'data' => [
                                                '$ref' => "#/components/schemas/{$recordDefinitionName}"
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            $outSubPaths['{identifier}'] ?: []
        );

        // GET or POST /records/{identifier}/edit
        $outSubPaths['{identifier}/edit'] = array_merge_recursive(
            [
                'get' => [
                    'tags' => [ $recordClass ],
                    'summary' => "Get form/data needed to edit the `{$recordClass}` record",
                    'parameters' => [
                        [ '$ref' => '#/components/parameters/identifier' ],
                        [ '$ref' => '#/components/parameters/include' ],
                        [ '$ref' => '#/components/parameters/format' ],
                        [ '$ref' => '#/components/parameters/accept' ]
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Successful response',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'success' => [
                                                'type' => 'boolean'
                                            ],
                                            'data' => [
                                                '$ref' => "#/components/schemas/{$recordDefinitionName}"
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],
                'post' => [
                    'tags' => [ $recordClass ],
                    'summary' => "Submit changes to apply to the `{$recordClass}` record",
                    'parameters' => [
                        [ '$ref' => '#/components/parameters/identifier' ],
                        [ '$ref' => '#/components/parameters/include' ],
                        [ '$ref' => '#/components/parameters/format' ],
                        [ '$ref' => '#/components/parameters/accept' ]
                    ],
                    'requestBody' => [
                        'description' => "New values for one or more `{$recordClass}` record fields",
                        'required' => true,
                        'content' => [
                            'application/x-www-form-urlencoded' => [
                                'schema' => [ '$ref' => "#/components/schemas/{$recordDefinitionName}" ]
                            ]
                        ]
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Successful response',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'success' => [
                                                'type' => 'boolean'
                                            ],
                                            'data' => [
                                                '$ref' => "#/components/schemas/{$recordDefinitionName}"
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            $outSubPaths['{identifier}/edit'] ?: []
        );

        // POST /records/{identifier}/delete
        $outSubPaths['{identifier}/delete'] = array_merge_recursive(
            [
                'post' => [
                    'tags' => [ $recordClass ],
                    'summary' => "Delete this `{$recordClass}` record",
                    'parameters' => [
                        [ '$ref' => '#/components/parameters/identifier' ],
                        [ '$ref' => '#/components/parameters/include' ],
                        [ '$ref' => '#/components/parameters/format' ],
                        [ '$ref' => '#/components/parameters/accept' ]
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Successful response',
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'success' => [
                                                'type' => 'boolean'
                                            ],
                                            'data' => [
                                                '$ref' => "#/components/schemas/{$recordDefinitionName}"
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            $outSubPaths['{identifier}/delete'] ?: []
        );
    }

    protected static function normalizeSchemaObject(array $object)
    {
        if (!empty($object['x-activeRecord'])) {
            if (!class_exists($object['x-activeRecord'])) {
                throw new Exception('x-activeRecord value does not match an available class: ' . $object['x-activeRecord']);
            }

            if (!is_a($object['x-activeRecord'], ActiveRecord::class, true)) {
                throw new Exception('x-activeRecord value is not an ActiveRecord subclass: ' . $object['x-activeRecord']);
            }

            static::fillSchemaFromActiveRecord($object['x-activeRecord'], $object);
        }

        return $object;
    }

    protected static function fillSchemaFromActiveRecord($className, &$outSchema)
    {
        $outSchema['type'] = 'object';

        $required = [];

        foreach ($className::aggregateStackedConfig('fields') AS $fieldName => $fieldConfig) {
            if ($fieldName == 'RevisionID' && is_a($className, VersionedRecord::class, true)) {
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

            $outSchema['properties'][$fieldName] = isset($outSchema['properties'][$fieldName]) ? array_merge($propertyDefaults, $outSchema['properties'][$fieldName]) : $propertyDefaults;
        }

        foreach ($className::aggregateStackedConfig('dynamicFields') AS $fieldName => $fieldConfig) {
            $propertyDefaults = [];

            if (!empty($fieldConfig['label'])) {
                $propertyDefaults['title'] = $fieldConfig['label'];
            }

            if (!empty($fieldConfig['description'])) {
                $propertyDefaults['description'] = $fieldConfig['description'];
            }

            // try to generate description via relationship config
            if (empty($propertyDefaults['description'])
                && empty($fieldConfig['getter'])
                && empty($fieldConfig['method'])
                && !empty($fieldConfig['relationship'])
                && $relationshipConfig = $className::getStackedConfig('relationships', $fieldConfig['relationship'])
            ) {
                if ($relationshipConfig['type'] == 'one-one') {
                    $propertyDefaults['description'] = "The `{$relationshipConfig['class']}` record referenced by the local `{$relationshipConfig['local']}` field";
                } elseif ($relationshipConfig['type'] == 'many-many') {
                    $propertyDefaults['description'] = "The `{$relationshipConfig['class']}` records linked via `{$relationshipConfig['linkClass']}` records";
                } elseif ($relationshipConfig['type'] == 'one-many') {
                    $propertyDefaults['description'] = "The `{$relationshipConfig['class']}` records linked via the foreign `{$relationshipConfig['foreign']}` field";
                } elseif ($relationshipConfig['type'] == 'context-parent') {
                    $propertyDefaults['description'] = "The records referenced by the local `{$relationshipConfig['classField']}` + `{$relationshipConfig['local']}` fields";
                }
            }

            $propertyDefaults['description'] = rtrim($propertyDefaults['description'], ". \n");

            if (!empty($propertyDefaults['description'])) {
                $propertyDefaults['description'] .= ', included';
            } else {
                $propertyDefaults['description'] = 'Included';
            }

            $propertyDefaults['description'] .= " when `?include={$fieldName}`";

            $outSchema['properties'][$fieldName] = isset($outSchema['properties'][$fieldName]) ? array_merge($propertyDefaults, $outSchema['properties'][$fieldName]) : $propertyDefaults;
        }

        if (count($required)) {
            $outSchema['required'] = isset($outSchema['required']) ? array_unique(array_merge($outSchema['required'], $required)) : $required;
        }
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
            $prefix = '#/components/schemas/';
            $prefixLen = strlen($prefix);

            if (substr($path, 0, $prefixLen) === $prefix) {
                return substr($path, $prefixLen);
            }
        }

        return null;
    }

    public static function flattenAllRefs(array $document, array $scope = null)
    {
        // begin scope at entire document
        $scope = $scope === null ? $document : $scope;

        // loop through each direct descendent
        foreach ($scope as $key => &$value) {
            if (!is_array($value)) {
                continue;
            }

            // flatten any refs first
            $value = static::dereferenceNode($value, $document);

            // then descend to flatten any childern
            $value = static::flattenAllRefs($document, $value);
        }

        // return only the scope of this iteration
        return $scope;
    }
}