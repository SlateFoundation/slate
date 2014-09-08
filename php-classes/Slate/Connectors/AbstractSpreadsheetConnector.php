<?php

namespace Slate\Connectors;

use SpreadsheetReader;

class AbstractSpreadsheetConnector extends \Slate\Connectors\AbstractConnector
{
    // protected methods
    protected static function _requireColumns($spreadsheetTitle, SpreadsheetReader $spreadsheet, array $requiredColumns, array $columnsMap = null)
    {
        $columns = $spreadsheet->getColumnNames();
        
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
				$spreadsheetTitle.' spreadsheet is missing required column' . (count($missingColumns) != 1 ? 's' : '') . ': '
				.join(',', $missingColumns)
			);
		}
    }

    protected static function _readRow(array $row, array $columnsMap)
    {
        $output = array();

        foreach ($columnsMap AS $externalKey => $internalKey) {
            if (array_key_exists($externalKey, $row)) {
                $output[$internalKey] = $row[$externalKey];
                unset($row[$externalKey]);
            }
        }

        $output['_rest'] = $row;

        return $output;
    }
}