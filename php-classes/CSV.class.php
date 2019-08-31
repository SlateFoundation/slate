<?php

class CSV
{
    public static function fromRecords($records, $columns = '*')
    {
        $tmp = fopen('php://temp', 'r+');
        static::writeToStream($tmp, $records, $columns);
        rewind($tmp);
        $output = file_get_contents($tmp);
        fclose($tmp);

        return $output;
    }

    public static function respond($records, $filename = null, $columns = '*')
    {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment'.($filename ? '; filename="'.str_replace('"', '', $filename).'.csv"' : ''));
        static::writeToStream(fopen('php://output', 'w'), $records, $columns);
        exit();
    }

    public static function writeToStream($stream, $records, $columns = '*')
    {
        if (!is_array($records)) {
            throw new Exception('fromRecords expects an array');
        } elseif (empty($records)) {
            return 'No data';
        }

        if (is_string($columns) && $columns != '*') {
            $columns = explode(',', $columns);
        }

        $firstRecord = $records[0];

        if (is_array($firstRecord)) {
            $columnNames = array_keys($firstRecord);
            $columnNames = array_combine($columnNames, $columnNames);
        } else {
            $dynamicFields = $firstRecord->aggregateStackedConfig('dynamicFields');
            $fields = $firstRecord->aggregateStackedConfig('fields');

            $columnNames = array_merge(array_keys($fields), array_keys($dynamicFields));
            $columnNames = array_combine($columnNames, $columnNames);

            foreach ($columnNames AS &$columnName) {
                $dynamicField = $dynamicFields[$columnName];
                $field = $fields[$columnName];

                if ($dynamicField && !empty($dynamicField['label'])) {
                    $columnName = $dynamicField['label'];
                } elseif ($field && !empty($field['label'])) {
                    $columnName = $field['label'];
                }
            }
        }

        fputcsv($stream, static::getColumns($columnNames, $columns));

        foreach ($records AS $record) {
            fputcsv(
                $stream,
                static::getColumns(
                    is_array($record) ? $record : JSON::translateObjects($record, false, $columns, true),
                    $columns
                )
            );
        }
    }

    public static function getColumns($array, $columns = null)
    {
        if (is_array($columns)) {
            $newArray = array();
            foreach ($columns AS $key) {
                $newArray[$key] = $array[$key];
            }
            $array = $newArray;
        }

        return $array;
    }
}
