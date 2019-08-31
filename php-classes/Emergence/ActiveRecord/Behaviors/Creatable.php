<?php

namespace Emergence\ActiveRecord\Behaviors;

class Creatable implements BehaviorInterface
{
    protected static function getFieldNames(array &$options)
    {
        if (!empty($options['useUpperCamelCase'])) {
            return [
                'created' => 'Created',
                'creator_id' => 'CreatorID'
            ];
        } else {
            return [
                'created' => 'created',
                'creator_id' => 'creator_id'
            ];
        }
    }

    public static function beforeInitFields(array &$arguments = [], array &$options = [])
    {
        $fieldNames = static::getFieldNames($options);

        if (empty($arguments['config'][$fieldNames['created']])) {
            $arguments['config'][$fieldNames['created']] = [
                'type' => 'timestamp',
                'default' => 'CURRENT_TIMESTAMP'
            ];
        }
        
        if (empty($arguments['config'][$fieldNames['creator_id']])) {
            $arguments['config'][$fieldNames['creator_id']] = [
                'type' => 'uint',
                'null' => true
            ];
        }
    }
}
