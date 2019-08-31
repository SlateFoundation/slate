<?php

trait FieldValuesRequestHandlerTrait
{
    public static function handleFieldValuesRequest($fieldName, array $additionalValues = array())
    {
        $recordClass = static::$recordClass;

        $recordFields = $recordClass::aggregateStackedConfig('fields');

        if (!array_key_exists($fieldName, $recordFields)) {
            return static::throwInvalidRequestError('Field not found: '.$fieldName);
        }

        $field = $recordFields[$fieldName];
        $query = $_REQUEST['q'];

        switch ($field['type']) {
            case 'enum':
                $values = $field['values'];
                if ($query) {
                    $values = array_filter($values, function($value) use ($query) {
                        return stripos($value, $query) !== false;
                    });
                }

                break;

            case 'string':
            case 'uint':
                $conditions = static::buildBrowseConditions();

                if ($query) {
                    $conditions[] = sprintf('%s LIKE "%%%s%%"', $field['columnName'], DB::escape($query));
                }

                try {
                    $values = DB::allValues(
                        'Value',
                        'SELECT DISTINCT `%3$s`.`%1$s` AS Value FROM `%2$s` AS `%3$s` WHERE `%3$s`.`%1$s` IS NOT NULL AND (%4$s)',
                        [
                            $field['columnName'],
                            $recordClass::$tableName,
                            $recordClass::getTableAlias(),
                            $conditions ? join(') AND (', $recordClass::mapConditions($conditions)) : 'TRUE'
                        ]
                    );
                } catch (\TableNotFoundException $e) {
                    $values = [];
                }

                break;
        }

        $values = array_unique(array_merge($values, $additionalValues));

        natcasesort($values);

        return static::respond('task-field-values', [
            'data' => array_values($values),
            'field' => $fieldName,
            'total' => count($values)
        ]);
    }
}