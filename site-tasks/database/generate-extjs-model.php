<?php

return [
    'title' => 'Generate Ext JS model',
    'description' => 'Generate Ext JS model definition for a given ActiveRecord class',
    'icon' => 'table',
    'handler' => function () {
        if (empty($_GET['class'])) {
            return static::respond('classes', [
                'classes' => Emergence\ActiveRecord\TablesManager::getActiveRecordClasses()
            ]);
        }

        if (!class_exists($_GET['class'])) {
            return static::throwNotFoundError('class not found');
        }

        if (!is_a($_GET['class'], 'ActiveRecord', true)) {
            return static::throwError('class does not implement ActiveRecord');
        }

        return static::respond('code', [
            'title' => "ExtJS model definition for $_GET[class]",
            'code' => Sencha\CodeGenerator::getRecordModel($_GET['class'])
        ]);
    }
];