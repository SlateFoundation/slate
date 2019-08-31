<?php

class SpreadsheetReader
{
    protected $_options = array(
        'parseHeader' => true
        ,'autoTrim' => true
        ,'packedColumn' => false // set to an integer index to pack extra columns into given column by comma
        ,'arrayValues' => false
    );
    protected $_fh;
    protected $_columnNames;
    protected $_bomFound;


    public static function createFromFile($filename, $options = array())
    {
        return static::createFromStream(fopen($filename, 'r'), File::getMIMEType($filename), $options);
    }

    public static function createFromStream($stream, $mimeType = 'text/csv', $options = array())
    {
        switch ($mimeType) {
            case 'text/plain':
            case 'text/csv':
            {
                return new static($stream, $options);
            }

            case 'application/vnd.ms-office':
            {
                throw new Exception('Excel import not yet supported');
            }

            default:
            {
                throw new Exception('Unsupported spreadsheet mime-type: '.$mimeType);
            }
        }

        return $mimeType;
    }


    public function __construct($fileHandle, $options = array())
    {
        $this->_fh = $fileHandle;
        $this->_options = array_merge($this->_options, $options);

        // read header
        if ($this->_options['parseHeader']) {
            $this->_columnNames = $this->getNextRow();

            if (is_string($this->_options['packedColumn'])) {
                $this->_options['packedColumn'] = array_search($this->_options['packedColumn'], $this->_columnNames);
            }
        }
    }


    public function getNextRow($assoc = true)
    {
        if (!$row = fgetcsv($this->_fh)) {
            return false;
        }

        if (!isset($this->_bomFound)) {
            $this->_bomFound = count($row) && substr($row[0], 0, 3) == "\xEF\xBB\xBF";

            if ($this->_bomFound) {
                $row[0] = str_getcsv(substr($row[0], 3))[0];
            }
        }

        if ($this->_options['autoTrim']) {
            $row = array_map('trim', $row);
        }

        if ($assoc && isset($this->_columnNames)) {
            if (is_int($this->_options['packedColumn']) && ($columnCount = count($this->_columnNames)) < ($rowCount = count($row))) {
                $row[$this->_options['packedColumn']] .= ','.join(',', array_splice($row, $this->_options['packedColumn'] + 1, $rowCount - $columnCount));
            }

            if ($this->_options['arrayValues']) {
                $columns = array_values($this->_columnNames);
                $values = array_values($row);
                $row = [];

                foreach ($columns as $i => $key) {
                    if (array_key_exists($key, $row)) {
                        if (is_array($row[$key])) {
                            $row[$key][] = $values[$i];
                        } else {
                            $row[$key] = [ $row[$key], $values[$i] ];
                        }
                    } else {
                        $row[$key] = $values[$i];
                    }
                }

                return $row;
            } else {
                return array_combine($this->_columnNames, $row);
            }
        }

        return $row;
    }


    public function hasColumn($columnName)
    {
        return $this->_options['parseHeader'] && in_array($columnName, $this->_columnNames);
    }

    public function hasColumns($columnNames)
    {
        return $this->_options['parseHeader'] && !array_diff($columnNames, $this->_columnNames);
    }

    public function getColumnNames()
    {
        return $this->_columnNames;
    }

    public function writeToTable($tableName, $type = 'MyISAM', $temporary = false)
    {
        $fieldDefs = array_map(function($cn) {
            return sprintf('`%s` varchar(255) default NULL', $cn);
        }, $this->_columnNames);

        // trim blank last column
        $trimLast = false;
        if (!end($this->_columnNames)) {
            $trimLast = true;
            array_pop($fieldDefs);
        }

        // create table
        DB::nonQuery(
            'CREATE TABLE `%s` (%s) ENGINE=%s DEFAULT CHARSET=utf8;'
            ,array(
                $tableName
                ,join(',', $fieldDefs)
                ,$type
            )
        );

        // write rows
        $count = 0;
        while ($row = $this->getNextRow(false)) {
            if ($trimLast) {
                array_pop($row);
            }

            DB::nonQuery(
                'INSERT INTO `%s` VALUES ("%s")'
                ,array(
                    $tableName
                    ,implode('","', array_map(array('DB', 'escape'), $row))
                )
            );
            $count++;
        }

        return $count;
    }

    public function close()
    {
        fclose($this->_fh);
    }
}