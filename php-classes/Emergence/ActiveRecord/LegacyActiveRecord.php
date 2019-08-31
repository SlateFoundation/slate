<?php

namespace Emergence\ActiveRecord;

abstract class LegacyActiveRecord extends AbstractSqlRecord
{
    public static $behaviors = [
        Behaviors\Creatable::class => [
            'useUpperCamelCase' => true
        ]
    ];

    public static $fields = [
        'id' => null,
        'class' => null,
        'ID' => [
            'type' => 'integer',
            'autoIncrement' => true,
            'unsigned' => true,
            'includeInSummary' => true
        ],
        'Class' => [
            'type' => 'enum',
            'null' => false,
            'values' => []
        ]
    ];

    protected static function initField($field, array $options = [])
    {
        switch ($field) {
            case 'ID':
                return parent::initField('id', $options);
            case 'Class':
                return parent::initField('class', $options);
            default:
                return parent::initField($field, $options);
        }
    }
}
