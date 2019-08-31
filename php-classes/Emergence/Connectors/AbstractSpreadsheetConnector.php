<?php

namespace Emergence\Connectors;

use ActiveRecord;
use SpreadsheetReader;
use Psr\Log\LogLevel;

class AbstractSpreadsheetConnector extends \Emergence\Connectors\AbstractConnector
{
    use \Emergence\Classes\StackedConfigTrait;

    public static $logRowColumnCount = 3;

    public static $onBeforeValidateRecord;
    public static $onValidateRecord;
    public static $onBeforeSaveRecord;
    public static $onSaveRecord;

    // protected methods
    protected static function initRequiredColumns(array $config)
    {
        $requiredColumns = [];

        foreach ($config AS $key => $value) {
            if (!$value) {
                if (is_string($key) && array_key_exists($key, $requiredColumns)) {
                    unset($requiredColumns[$key]);
                }
                continue;
            }

            if (!is_string($key)) {
                $key = $value;
                $value = true;
            }

            $requiredColumns[$key] = $value;
        }

        return $requiredColumns;
    }

    protected static function _requireColumns($noun, SpreadsheetReader $spreadsheet, array $requiredColumns, array $columnsMap = null)
    {
        $columns = $spreadsheet->getColumnNames();
        $requiredColumns = array_keys(array_filter($requiredColumns));

        if ($columnsMap) {
            $mappedColumns = array();
            foreach ($columns AS $columnName) {
                $mappedColumns[] = array_key_exists($columnName, $columnsMap) ? $columnsMap[$columnName] : $columnName;
            }
            $columns = $mappedColumns;
        }

        $missingColumns = array_diff($requiredColumns, $columns);

        if (count($missingColumns)) {
            throw new \Exception(
                $noun.' spreadsheet is missing required column'.(count($missingColumns) != 1 ? 's' : '').': '
                .join(',', $missingColumns)
                .'. Found columns: '
                .join(', ', $columns)
            );
        }
    }

    protected static function _readRow(array $row, array $columnsMap)
    {
        $output = array();

        // extract columns via alias mappings
        foreach ($columnsMap as $alias => $key) {
            // a falsey-value indicates a disabled mapping
            if (!$key) {
                continue;
            }

            // a suffix of [] indicates a value that should be read into an array
            if (substr($key, -2) == '[]') {
                $key = substr($key, 0, -2);
                $arrayValue = true;
            } else {
                $arrayValue = false;
            }

            // read under alias, then native key
            foreach ([$alias, $key] as $column) {
                if (array_key_exists($column, $row)) {
                    $value = $row[$column];
                    unset($row[$column]);
                } else {
                    continue;
                }

                if ($arrayValue) {
                    if (!array_key_exists($key, $output)) {
                        $output[$key] = is_array($value) ? $value : [$value];
                    } elseif (is_array($output[$key])) {
                        if (is_array($value)) {
                            $output[$key] = array_merge($output[$key], $value);
                        } else {
                            $output[$key][] = $value;
                        }
                    } else {
                        $output[$key] = array_merge(
                            is_array($output[$key]) ? $output[$key] : [ $output[$key] ],
                            is_array($value) ? $value : [ $value ]
                        );
                    }
                } else {
                    $output[$key] = $value;
                }
            }
        }

        // filter out any empty cells in multi-value arrays
        foreach ($output as $key => &$value) {
            if (is_array($value)) {
                $value = array_filter($value);
            }
        }

        $output['_rest'] = $row;

        return $output;
    }

    protected static function _logRow(IJob $Job, $noun, $rowNumber, array $row)
    {
        $nonEmptyColumns = array_filter($row);
        unset($nonEmptyColumns['_rest']);

        $summaryColumns = array_slice($nonEmptyColumns, 0, static::$logRowColumnCount, true);

        $Job->log(
            LogLevel::DEBUG,
            'Analyzing {noun} row #{rowNumber}: {rowSummary}',
            [
                'noun' => $noun,
                'rowNumber' => $rowNumber,
                'rowSummary' => http_build_query($summaryColumns).(count($nonEmptyColumns) > count($summaryColumns) ? '&...' : '')
            ]
        );
    }

    protected static function _validateRecord(IJob $Job, ActiveRecord $Record, array &$results)
    {
        // call configurable hook
        if (is_callable(static::$onBeforeValidateRecord)) {
            call_user_func(static::$onBeforeValidateRecord, $Job, $Record, $results);
        }


        // validate and store result
        $isValid = $Record->validate();


        // trace any failed validation in the log and in the results
        if (!$isValid) {
            $firstErrorField = key($Record->validationErrors);
            $error = $Record->validationErrors[$firstErrorField];
            $results['failed']['invalid'][$firstErrorField][is_array($error) ? http_build_query($error) : $error]++;
            $Job->logInvalidRecord($Record);
        }


        // call configurable hook
        if (is_callable(static::$onValidateRecord)) {
            call_user_func(static::$onValidateRecord, $Job, $Record, $results, $isValid);
        }


        return $isValid;
    }

    protected static function _saveRecord(IJob $Job, ActiveRecord $Record, $pretend, array &$results, $logOptions = array())
    {
        // call configurable hook
        if (is_callable(static::$onBeforeSaveRecord)) {
            call_user_func(static::$onBeforeSaveRecord, $Job, $Record, $results, $pretend, $logOptions);
        }


        // generate log entry
        $logEntry = $Job->logRecordDelta($Record, $logOptions);

        if ($logEntry['action'] == 'create') {
            $results['created']++;
        } elseif ($logEntry['action'] == 'update') {
            $results['updated']++;

            foreach (array_keys($logEntry['changes']) AS $changedField) {
                $results['updated-fields'][$changedField]++;
            }
        }


        // save changes
        if (!$pretend) {
            $Record->save();
        }


        // call configurable hook
        if (is_callable(static::$onSaveRecord)) {
            call_user_func(static::$onSaveRecord, $Job, $Record, $results, $pretend, $logOptions);
        }
    }
}
