<?php

return [
    'title' => 'Generate table SQL',
    'description' => 'Generate and optionally execute `CREATE TABLE` SQL for a given ActiveRecord class',
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

        $sql = SQL::getCreateTable($_GET['class']);

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $mysqli = DB::getMysqli();
            $sql = preg_replace('/^--.*/m', '', $sql);

            if (!$success = $mysqli->multi_query($sql)) {
                $error = $mysqli->error;
            }

            // free all results
            do {
                if ($result = $mysqli->use_result()) {
                    $result->free_result();
                }
            } while ($mysqli->more_results() && $mysqli->next_result());

            return static::respond('message', [
                'success' => $success,
                'statusClass' => $success ? 'success' : 'danger',
                'title' => $success ? 'Table(s) created' : 'Failed to create table(s)',
                'message' => $success ? "Tables for class `$_GET[class]` have been created" : $error
            ]);
        }

        return static::respond('confirm-code', [
            'title' => "Create table(s) for $_GET[class]",
            'code' => $sql
        ]);
    }
];