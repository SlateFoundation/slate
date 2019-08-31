<?php

class TagItem extends ActiveRecord
{
    public static $tableName = 'tag_items';
    public static $rootClass = __CLASS__;

    public static $fields = array(
        'ID' => null
        ,'Class' => null
        ,'ContextClass' => array(
            'type' => 'string'
            ,'notnull' => false
        )
        ,'ContextID' => array(
            'type' => 'integer'
            ,'notnull' => false
        )
        ,'TagID' => array(
            'type' => 'integer'
        )
    );

    public static $relationships = array(
        'Context' => array(
            'type' => 'context-parent'
        )
        ,'Tag' => array(
            'type' => 'one-one'
            ,'class' => 'Tag'
        )
    );

    public static $indexes = array(
        'TagItem' => array(
            'fields' => array('TagID','ContextClass','ContextID')
            ,'unique' => true
        )
    );



    public function getTitle()
    {
        return sprintf('TagItem %s-%u + %s', $this->ContextClass, $this->ContextID, $this->Tag ? $this->Tag->getTitle() : '[tag not found]');
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        $this->_validator->validate(array(
            'field' => 'TagID'
            ,'validator' => 'number'
        ));

        $this->_validator->validate(array(
            'field' => 'ContextClass'
            ,'validator' => 'className'
        ));

        $this->_validator->validate(array(
            'field' => 'ContextID'
            ,'validator' => 'number'
        ));

        // save results
        $this->_isValid = $this->_isValid && !$this->_validator->hasErrors();
        if (!$this->_isValid) {
            $this->_validationErrors = array_merge($this->_validationErrors, $this->_validator->getErrors());
        }


        return $this->_isValid;
    }

    public function destroy()
    {
        DB::nonQuery('DELETE FROM `%s` WHERE `%s` = \'%s\' AND `%s` = %u AND `%s` = %u', array(
            static::$tableName
            ,static::_cn('ContextClass')
            ,$this->ContextClass
            ,static::_cn('ContextID')
            ,$this->ContextID
            ,static::_cn('TagID')
            ,$this->TagID
        ));

        return DB::affectedRows() > 0;
    }

    public static function getTagsSummary($options = array())
    {
        $options = array_merge(array(
            'tagConditions' => array()
            ,'itemConditions' => array()
            ,'Class' => false
            ,'classConditions' => array()
            ,'overlayTag' => false
            ,'order' => 'itemsCount DESC'
            ,'excludeEmpty' => true
            ,'limit' => false
        ), $options);

        // initialize conditions
        $options['tagConditions'] = Tag::mapConditions($options['tagConditions']);

        if (!empty($options['Class'])) {
            $options['classConditions'] = $options['Class']::mapConditions($options['classConditions']);
        }

        $options['itemConditions'] = TagItem::mapConditions($options['itemConditions']);

        // build query
        if (!empty($options['classConditions'])) {
            $classSubquery = 'SELECT `%s` FROM `%s` WHERE (%s)';
            $classParams = array(
                $options['Class']::getColumnName('ID')
                ,$options['Class']::$tableName
                ,join(') AND (', $options['classConditions'])
            );
        }

        $itemsCountQuery = 'SELECT COUNT(*) FROM `%s` TagItem WHERE TagItem.`%s` = Tag.`%s` AND (%s)';
        $itemsCountParams = array(
            TagItem::$tableName
            ,TagItem::getColumnName('TagID')
            ,Tag::getColumnName('ID')
            ,count($options['itemConditions']) ? join(') AND (', $options['itemConditions']) : '1'
        );

        if (!empty($options['overlayTag'])) {
            if (!is_object($OverlayTag = $options['overlayTag']) && !$OverlayTag = Tag::getByHandle($options['overlayTag'])) {
                throw new Excoption('Overlay tag not found');
            }

            $itemsCountQuery .= sprintf(
                ' AND (TagItem.`%s`,TagItem.`%s`) IN (SELECT OverlayTagItem.`%s`, OverlayTagItem.`%s` FROM `%s` OverlayTagItem WHERE OverlayTagItem.`%s` = %u)'
                ,TagItem::getColumnName('ContextClass')
                ,TagItem::getColumnName('ContextID')
                ,TagItem::getColumnName('ContextClass')
                ,TagItem::getColumnName('ContextID')
                ,TagItem::$tableName
                ,TagItem::getColumnName('TagID')
                ,$OverlayTag->ID
            );
        }

        if (isset($classSubquery)) {
            $itemsCountQuery .= sprintf(
                ' AND TagItem.`%s` = "%s" AND TagItem.`%s` IN (%s)'
                ,TagItem::getColumnName('ContextClass')
                ,$options['Class']::getStaticRootClass()
                ,TagItem::getColumnName('ContextID')
                ,DB::prepareQuery($classSubquery, $classParams)
            );
        }



        $tagSummaryQuery = 'SELECT Tag.*, (%s) AS itemsCount FROM `%s` Tag WHERE (%s)';
        $tagSummaryParams = array(
            DB::prepareQuery($itemsCountQuery, $itemsCountParams)
            ,Tag::$tableName
            ,count($options['tagConditions']) ? join(') AND (', $options['tagConditions']) : '1'
        );

        // exclude empty
        if ($options['excludeEmpty']) {
            $tagSummaryQuery .= ' HAVING itemsCount > 0';
        }

        // add order options
        if ($options['order']) {
            $tagSummaryQuery .= ' ORDER BY '.join(',', static::_mapFieldOrder($options['order']));
        }

        // add limit options
        if ($options['limit']) {
            $tagSummaryQuery .= sprintf(' LIMIT %u,%u', $options['offset'], $options['limit']);
        }

        try {
            // return indexed table or list
            if ($options['indexField']) {
                return DB::table(Tag::getColumnName($options['indexField']), $tagSummaryQuery, $tagSummaryParams);
            } else {
                return DB::allRecords($tagSummaryQuery, $tagSummaryParams);
            }
        } catch (TableNotFoundException $e) {
            return array();
        }
    }
}