<?php

return [
    'title' => 'Repair nested set',
    'description' => 'Recalculate the left/right node positioning for a table using NestingBehavior. Useful after manually editing the table.',
    'icon' => 'sitemap',
    'handler' => function () {
        if (empty($_GET['class'])) {
            return static::respond('classes', [
                'classes' => array_filter(Emergence\ActiveRecord\TablesManager::getActiveRecordClasses(), function ($className) {
                    return $className::fieldExists('Left') && $className::fieldExists('Right') && $className::fieldExists('ParentID');
                })
            ]);
        }

        $className = $_GET['class'];

        if (!class_exists($className)) {
            return static::throwNotFoundError('class not found');
        }

        if (!is_a($className, 'ActiveRecord', true)) {
            return static::throwError('class does not implement ActiveRecord');
        }

        if (!$className::fieldExists('Left') || !$className::fieldExists('Right') || !$className::fieldExists('ParentID')) {
            return static::throwError('class does not implement fields Left, Right, and ParentID');
        }

        $sql = SQL::getCreateTable($className);

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            try {
                $records = NestingBehavior::repairTable($className);
                $success = true;
            } catch (Exception $e) {
                $error = $e->getMessage();
                $success = false;
            }

            return static::respond('message', [
                'success' => $success,
                'statusClass' => $success ? 'success' : 'danger',
                'title' => $success ? 'Table renested' : 'Failed to create table(s)',
                'message' => $success ? "Renested $records records for class `$className`" : $error
            ]);
        }

        return static::respond('confirm', [
            'title' => "Renest table for $className",
            'question' => 'Are you sure you want to recalculate the left/right positions for every record?'
        ]);
    }
];