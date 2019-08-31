<?php

namespace Sencha;

use ActiveRecord;
use VersionedRecord;


class CodeGenerator
{
    const INDENT = '    ';

    public static $validatorTypes = [
        'presence' => 'Ext.data.validator.Presence',
        'min' => 'Ext.data.validator.Range',
        'max' => 'Ext.data.validator.Range',
        'format' => 'Ext.data.validator.Format'
    ];

    public static function getRecordModel($recordClass)
    {
        // compile class information
        $shortName = $recordClass::getDefaultForeignRelationshipName();
        $route = $recordClass::$collectionRoute ? $recordClass::$collectionRoute : '/'.str_replace(' ', '-', $recordClass::$pluralNoun);
        $requires = [
            'Emergence.ext.proxy.Records',
            'Ext.data.identifier.Negative'
        ];


        // compile fields information
        $fieldGroups = [
            'ActiveRecord' => ActiveRecord::getStackedConfig('fields')
        ];

        if (is_a($recordClass, VersionedRecord::class, true)) {
            $fieldGroups['VersionedRecord'] = array_diff_key(VersionedRecord::getStackedConfig('fields'), $fieldGroups['ActiveRecord']);
        }

        $fieldGroups[$shortName] = array_diff_key($recordClass::aggregateStackedConfig('fields'), $fieldGroups['ActiveRecord'], $fieldGroups['VersionedRecord'] ?: []);
        unset($fieldGroups['VersionedRecord']['RevisionID']);

        foreach ($fieldGroups as $groupName => &$fields) {
            foreach ($fields as $fieldName => &$fieldConfig) {
                $fieldConfig = static::buildFieldConfig($fieldName, $fieldConfig, $recordClass);
            }
        }


        $relationships = $recordClass::aggregateStackedConfig('relationships');

        $validators = [];
        foreach ($recordClass::aggregateStackedConfig('validators') as $key => $config) {
            switch ($config['validator']) {
                case 'require-relationship':
                    $fieldName = $relationships[$config['field']]['local'];
                    $validators[] =  (object)[
                        'field' => $fieldName,
                        'type' => 'min',
                        'min' => 1,
                        'emptyMessage' => $config['errorMessage'] ?: "{$fieldName} is required"
                    ];
                    break;

                case 'handle':
                    $validators[] =  (object)[
                        'field' =>  $config['field'],
                        'type' => 'presence',
                        'message' => "{$config['field']} is required"
                    ];
                    $validators[] =  (object)[
                        'field' => $config['field'],
                        'type' => 'format',
                        'matcher' => (object) [ '_type' => 'regex', 'pattern' => '^[a-zA-Z][a-zA-Z0-9_:\.-]*$' ],
                        'message' => $config['errorMessage'] ?: "{$config['field']} is required"
                    ];
                    break;

                default:
                    $validators[] = (object)[
                        'field' => $config['field'],
                        'type' => 'presence',
                        'message' => "{$config['field']} is required"
                    ];
            }
        }

        foreach ($validators as $validator) {
            $requires[] = static::$validatorTypes[$validator->type];
        }


        // write header
        $out = "Ext.define('MyApp.model.{$shortName}', {";
        $out .= PHP_EOL;
        $out .= static::buildObjectKeyCode('extend', 'Ext.data.Model', 1, true);
        $out .= static::buildObjectKeyCode('requires', array_unique($requires), 1, true);
        $out .= PHP_EOL;

        // write model config
        $out .= PHP_EOL;
        $out .= static::buildIndent(1);
        $out .= '// model config';
        $out .= PHP_EOL;
        $out .= static::buildObjectKeyCode('idProperty', 'ID', 1, true);
        $out .= static::buildObjectKeyCode('identifier', 'negative', 1, true);


        // write fields
        $out .= PHP_EOL;
        $out .= static::buildGroupedArrayCode('fields', $fieldGroups, 1, true);


        // write proxy
        $out .= PHP_EOL;
        $out .= static::buildObjectKeyCode('proxy', (object) [
            'type' => 'records',
            'url' => $route
        ], 1, true);


        // write validators
        $out .= PHP_EOL;
        $out .= static::buildObjectKeyCode('validators', $validators, 1);


        // write footer
        $out .= '});';
        $out .= PHP_EOL;


        return $out;
    }

    public static function buildGroupedArrayCode($key, $data, $indent = 0, $appendComma = false)
    {
        // analyze input
        end($data);
        $lastGroupName = key($data);
        end ($data[$lastGroupName]);
        $lastItemKey = key($data[$lastGroupName]);


        // build output
        $out .= static::buildIndent($indent);

        if ($key) {
            $out .= "{$key}: ";
        }

        $out .= '[';
        $out .= PHP_EOL;

        foreach ($data as $groupName => $items) {
            $out .= PHP_EOL;
            $out .= static::buildIndent($indent + 1);
            $out .= "// {$groupName} {$key}";
            $out .= PHP_EOL;

            foreach ($items as $itemKey => $itemConfig) {
                $out .= static::buildIndent($indent + 1);
                $out .= static::buildObjectCode($itemConfig, $indent + 1, $itemKey != $lastItemKey || $groupName != $lastGroupName);
            }
        }

        $out .= static::buildIndent($indent);
        $out .= ']';

        if ($appendComma) {
            $out .= ',';
        }

        $out .= PHP_EOL;

        return $out;
    }

    public static function buildObjectKeyCode($key, $value, $indent = 0, $appendComma = false)
    {
        $out .= static::buildIndent($indent);
        $out .= "{$key}: ";
        $out .= static::buildValueCode($value, $indent, $appendComma);

        return $out;
    }

    public static function buildValueCode($value, $indent = 0, $appendComma = false)
    {
        if (is_array($value)) {
            $out .= static::buildArrayCode($value, $indent, $appendComma);
        } elseif (is_object($value)) {
            if ($value->_type == 'regex') {
                $out .= static::buildRegexCode($value, $appendComma);
            } else {
                $out .= static::buildObjectCode($value, $indent, $appendComma);
            }
        } else {
            $out .= static::buildJsonCode($value, $appendComma);
        }

        return $out;
    }

    public static function buildArrayCode($data, $indent = 0, $appendComma = false)
    {
        // analyze input
        end ($data);
        $lastItemKey = key($data);


        // build output
        $out .= '[';
        $out .= PHP_EOL;

        foreach ($data as $itemKey => $itemConfig) {
            $out .= static::buildIndent($indent + 1);
            $out .= static::buildValueCode($itemConfig, $indent + 1, $itemKey != $lastItemKey || $groupName != $lastGroupName);
        }

        $out .= static::buildIndent($indent);
        $out .= ']';

        if ($appendComma) {
            $out .= ',';
        }

        $out .= PHP_EOL;

        return $out;
    }

    public static function buildObjectCode($data, $indent = 0, $appendComma = false)
    {
        // analyze input
        end($data);
        $lastConfigKey = key($data);


        // build output
        $out .= '{';
        $out .= PHP_EOL;

        foreach ($data as $configKey => $configValue) {
            $out .= static::buildObjectKeyCode($configKey, $configValue, $indent + 1, $configKey != $lastConfigKey);
        }

        $out .= static::buildIndent($indent);
        $out .= '}';

        if ($appendComma) {
            $out .= ',';
        }

        $out .= PHP_EOL;

        return $out;
    }

    public static function buildRegexCode($value, $appendComma = false)
    {
        $out .= '/' . $value->pattern . '/' . $value->modifiers;

        if ($appendComma) {
            $out .= ',';
        }

        $out .= PHP_EOL;

        return $out;
    }

    public static function buildJsonCode($value, $appendComma = false)
    {
        $json = json_encode($value);

        if (is_string($value)) {
            $json = str_replace(['"', '\/'], ['\'', '/'], $json);
        }

        $out .= $json;

        if ($appendComma) {
            $out .= ',';
        }

        $out .= PHP_EOL;

        return $out;
    }

    public static function buildIndent($indent)
    {
        return str_repeat(self::INDENT, $indent);
    }

    public static function buildFieldConfig($field, $fieldOptions, $recordClass = null)
    {
        $fieldConfig = [
            'name' => $field
        ];

        switch ($fieldOptions['type']) {
            case 'int':
            case 'uint':
            case 'integer':
            case 'tinyint':
            case 'smallint':
            case 'mediumint':
            case 'bigint':
                $fieldConfig['type'] = 'int';
                break;

            case 'float':
            case 'double':
            case 'decimal':
                $fieldConfig['type'] = 'float';
                break;

            case 'boolean':
                $fieldConfig['type'] = 'boolean';
                break;

            case 'enum':
            case 'set':
            case 'string':
            case 'clob':
            case 'blob':
            case 'password':
                $fieldConfig['type'] = 'string';
                break;

            case 'timestamp':
                $fieldConfig['type'] = 'date';
                $fieldConfig['dateFormat'] = 'timestamp';
                break;
            case 'date':
                $fieldConfig['type'] = 'date';
                $fieldConfig['dateFormat'] = 'Y-m-d';
                break;
            case 'year':
                $fieldConfig['type'] = 'date';
                $fieldConfig['dateFormat'] = 'Y';
                break;

            case 'serialized':
            case 'json':
                $fieldConfig['type'] = 'auto';
                break;

            default:
                throw new \Exception("getExtTypeConfig: unhandled type $fieldOptions[type]");
        }

        if ($field == 'Class' && $recordClass && ($defaultClass = $recordClass::getStaticDefaultClass())) {
            $fieldConfig['defaultValue'] = $defaultClass;
        } elseif (isset($fieldOptions['default'])) {
            if ($fieldOptions['type'] == 'timestamp' && $fieldOptions['default'] == 'CURRENT_TIMESTAMP') {
                $fieldConfig['allowNull'] = true;
            } else {
                $fieldConfig['defaultValue'] = $fieldOptions['default'];
            }
        } elseif (!$fieldOptions['notnull'] || $fieldOptions['autoincrement']) {
            $fieldConfig['allowNull'] = true;
        }

        if (in_array($field, ['Created', 'CreatorID', 'Modified', 'ModifierID'])) {
            $fieldConfig['persist'] = false;
        }

        return $fieldConfig;
    }
}