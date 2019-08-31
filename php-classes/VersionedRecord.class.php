<?php

abstract class VersionedRecord extends ActiveRecord
{
    // configure ActiveRecord
    public static $trackModified = true;

    public static $fields = array(
        'RevisionID' => array(
            'columnName' => 'RevisionID'
            ,'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        )
    );

    public static $relationships = array(
        'OldVersions' => array(
            'type' => 'history'
            ,'order' => array('RevisionID' => 'DESC')
        )
    );



    // configure VersionedRecord
    public static $historyTable;


    /*
     * Implement history relationship
     */
    /*public function getValue($name)
    {
        switch($name)
        {
            case 'RevisionID':
            {
                return isset($this->_record['RevisionID']) ? $this->_record['RevisionID'] : null;
            }
            default:
            {
                return parent::getValue($name);
            }
        }
    }*/

    protected static function _initRelationship($relationship, $options)
    {
        if ($options['type'] == 'history') {
            if (empty($options['class'])) {
                $options['class'] = get_called_class();
            }
        }

        return parent::_initRelationship($relationship, $options);
    }

    protected function _getRelationshipValue($relationship)
    {
        if (!isset($this->_relatedObjects[$relationship])) {
            $rel = static::getStackedConfig('relationships', $relationship);

            if ($rel['type'] == 'history') {
                $this->_relatedObjects[$relationship] = $rel['class']::getRevisionsByID($this->ID, $rel);
            }
        }

        return parent::_getRelationshipValue($relationship);
    }

    protected function _setFieldValue($field, $value)
    {
        // prevent setting RevisionID
        if ($field == 'RevisionID') {
            return false;
        }

        return parent::_setFieldValue($field, $value);
    }
    /*
     * Implement specialized getters
     */
    public static function getRevisionsByID($ID, $options = array())
    {
        $options['conditions']['ID'] = $ID;

        return static::getRevisions($options);
    }

    public static function getRevisions($options = array())
    {
        return static::instantiateRecords(static::getRevisionRecords($options));
    }

    public static function getRevisionRecords($options = array())
    {
        $options = array_merge(array(
            'indexField' => false
            ,'conditions' => array()
            ,'order' => false
            ,'limit' => false
            ,'offset' => 0
        ), $options);

        $query = 'SELECT * FROM `%s` WHERE (%s)';
        $params = array(
            static::getHistoryTableName()
            , count($options['conditions']) ? join(') AND (', static::_mapConditions($options['conditions'])) : 1
        );

        if ($options['order']) {
            $query .= ' ORDER BY '.join(',', static::_mapFieldOrder($options['order']));
        }

        if ($options['limit']) {
            $query .= sprintf(' LIMIT %u,%u', $options['offset'], $options['limit']);
        }


        if ($options['indexField']) {
            return DB::table(static::_cn($options['indexField']), $query, $params);
        } else {
            return DB::allRecords($query, $params);
        }
    }


    /*
     * Create new revisions on save
     */
    public function save($deep = true)
    {
        $wasDirty = false;

        if ($this->isDirty) {
            $wasDirty = true;
        }

        // save record as usual
        $return = parent::save($deep);

        if ($this->_isSaving) {
            return null;
        }

        if ($wasDirty) {
            // save a copy to history table
            $recordValues = $this->_prepareRecordValues();

            // maintain legacy behavior if trackModified is disabled and overwrite Creator
            if (!static::$trackModified) {
                $recordValues['Created'] = 'CURRENT_TIMESTAMP';
                $recordValues['CreatorID'] = !empty($_SESSION) && !empty($_SESSION['User']) ? $_SESSION['User']->ID : null;
            }

            $set = static::_mapValuesToSet($recordValues);

            DB::nonQuery(
                'INSERT INTO `%s` SET %s'
                , array(
                    static::getHistoryTableName()
                    , join(',', $set)
                )
            );
        }
    }

    public static function getRootClass($boundingParentClass = __CLASS__)
    {
        return parent::getRootClass($boundingParentClass);
    }

    public static function getStaticRootClass($boundingParentClass = __CLASS__)
    {
        return parent::getStaticRootClass($boundingParentClass);
    }

    public static function getHistoryTableName()
    {
        return static::$historyTable ?: 'history_' . static::$tableName;
    }
}