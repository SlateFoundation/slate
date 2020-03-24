<?php

class Tag extends ActiveRecord
{
    // support subclassing
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);

    // configure ActiveRecord
    public static $tableName = 'tags';
    public static $singularNoun = 'tag';
    public static $pluralNoun = 'tags';
    public static $collectionRoute = '/tags';

    public static $fields = array(
        'Title' => array(
            'includeInSummary' => true
        )
        ,'Handle' => array(
            'unique' => true,
            'includeInSummary' => true
        )
        ,'Description' => array(
            'notnull' => false
        )
    );

    public static $relationships = array(
        'Creator' => array(
            'type' => 'one-one'
            ,'local' => 'CreatorID'
            ,'class' => 'Person'
        )
        ,'Items' => array(
            'type' => 'one-many'
            ,'class' => 'TagItem'
        )
    );

    public static $searchConditions = array(
        'Prefix' => array(
            'qualifiers' => array('prefix')
            ,'points' => 2
            ,'sql' => 'Handle LIKE "%1$s.%%"'
        ),
        'Title' => array(
            'qualifiers' => ['any', 'title'],
            'points' => 1,
            'sql' => 'Title LIKE "%%%1$s%%"'
        ),
        'Handle' => array(
            'qualifiers' => ['any', 'handle'],
            'points' => 1,
            'sql' => 'Handle LIKE "%%%1$s%%"'
        )
    );

    // public methods
    public static function assignTags($contextClass, $contextID, $tags, $autoCreate = true)
    {
        $assignedTags = array();

        foreach ($tags AS $tagTitle) {
            if (!$tagTitle) {
                continue;
            }

            if ($Tag = static::getFromHandle($tagTitle, $autoCreate)) {
                $Tag->assignItem($contextClass, $contextID);
                $assignedTags[] = $Tag;
            }
        }

        return $assignedTags;
    }


    public static function splitTags($tags)
    {
        return $tags = preg_split('/\s*[,]+\s*/', trim($tags));
    }

    public static function setTags(ActiveRecord $Context, $tags, $autoCreate = true, $prefix = null)
    {
        $assignedTags = array();

        if (is_string($tags)) {
            $tags = static::splitTags($tags);
        } elseif (is_array($tags)) {
            $newTags = array();

            foreach ($tags as $string) {
                $splitString = static::splitTags($string);

                foreach ($splitString as $newTagTitle) {
                    $newTags[] = $newTagTitle;
                }
            }

            $tags = $newTags;
        }

        foreach ($tags AS $tag) {
            if ($tag && (is_string($tag) || is_int($tag))) {
                $tag = static::getFromHandle($tag, $autoCreate, $prefix);
            }

            if (!$tag) {
                continue;
            }

            $tag->assignItem($Context);
            $assignedTags[$tag->ID] = $tag;
        }

        if ($prefix) {
            try {
                $prefixTags = DB::allValues('ID', 'SELECT ID FROM `%s` WHERE Handle LIKE "%s.%%"', array(
                    \Tag::$tableName,
                    DB::escape($prefix)
                ));
            } catch (TableNotFoundException $e) {
                $prefixTags = array();
            }
        }

        // delete tags
        if (!$prefix || count($prefixTags)) { // if there are no existing tags with this prefix there are no items to delete
            try {
                DB::query(
                    'DELETE FROM `%s` WHERE ContextClass = "%s" AND ContextID = %u AND TagID NOT IN (%s) %s'
                    ,array(
                        TagItem::$tableName
                        ,DB::escape($Context->getRootClass())
                        ,$Context->ID
                        ,count($assignedTags) ? join(',', array_keys($assignedTags)) : '0'
                        ,!empty($prefixTags) ? (' AND TagID IN ('.implode(',', $prefixTags).')') : ''
                    )
                );
            } catch (TableNotFoundException $e) {
            }
        }

        return $assignedTags;
    }

    public static function getFromHandle($handle, $autoCreate = true, $prefix = null)
    {
        $Tag = false;

        if (is_numeric($handle)) {
            $Tag = static::getByID($handle);
        }

        if (!$Tag) {
            $Tag = static::getByHandle($handle);
        }

        if (!$Tag) {
            $Tag = static::getByTitle($handle, $prefix);
        }

        if (!$Tag && $autoCreate) {
            $Tag = static::create(array(
                'Title' => $handle,
                'Handle' => HandleBehavior::getUniqueHandle(__CLASS__, $prefix ? "$prefix.$handle" : $handle)
            ), true);
        }

        return $Tag;
    }

    public static function getAllByPrefix($prefix)
    {
        return static::getAllByWhere('Handle LIKE "'.DB::escape($prefix).'.%"');
    }

    public static function getAllPrefixes()
    {
        return DB::allValues('Handle', 'SELECT DISTINCT(SUBSTRING_INDEX(tags.Handle, ".", 1 )) AS Handle FROM `%s` tags WHERE Handle LIKE "%%.%%"', array(
            static::$tableName
        ));
    }

    public static function getByTitle($title, $prefix = null)
    {
        if ($prefix) {
            return static::getByWhere(array(
                'Title' => $title,
                'Handle LIKE "'.DB::escape($prefix).'.%%"'
            ));
        } else {
            return static::getByField('Title', $title, true);
        }
    }

    public function getValue($name)
    {
        switch ($name) {
            case 'Prefix':
                return preg_replace('/\..*$/', '', $this->Title);
            case 'UnprefixedTitle':
                return preg_replace('/^[^.]+\.\s*/', '', $this->Title);
            case 'HandlePrefix':
                return preg_replace('/\..*$/', '', $this->Handle);
            case 'UnprefixedHandle':
                return preg_replace('/^[^.]+\.\s*/', '', $this->Handle);
            default:
                return parent::getValue($name);
        }
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        $this->_validator->validate(array(
            'field' => 'Title'
        ));

        // check title uniqueness
        if ($this->isDirty && !$this->_validator->hasErrors('Title') && $this->Title) {
            $ExistingTag = Tag::getByTitle($this->Title);

            if ($ExistingTag && ($ExistingTag->ID != $this->ID)) {
                $this->_validator->addError('Title', 'A tag by this title already exists');
            }

            // Existing handle
            $ExistingHandle = Tag::getByHandle($this->Handle);

            if ($ExistingHandle && ($ExistingHandle->ID != $this->ID)) {
                $this->_validator->addError('Handle', 'A tag by this handle already exists');
            }
        }

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
    {
        HandleBehavior::onSave($this, $this->Title);

        return parent::save(true);
    }

    public function destroy()
    {
        // delete all TagItems
        DB::nonQuery('DELETE FROM `%s` WHERE TagID = %u', array(TagItem::$tableName, $this->ID));

        return parent::destroy();
    }

    public function assignItem($contextClass, $contextID = false)
    {
        if (is_object($contextClass) && is_a($contextClass, 'ActiveRecord')) {
            $contextID = $contextClass->ID;
            $contextClass = $contextClass->getRootClass();
        }

        $tagData = array(
            'TagID' => $this->ID
            ,'ContextClass' => $contextClass
            ,'ContextID' => $contextID
        );

        try {
            return TagItem::create($tagData, true);
        } catch (DuplicateKeyException $e) {
            return TagItem::getByWhere($tagData);
        }
    }


    public static function getAll($options = array())
    {
        $options = array_merge(array(
            'order' => array('Title' => 'ASC')
        ), $options);

        return parent::getAll($options);
    }


    public function getRandomItem($options)
    {
        return array_shift(static::getRandomItems(array_merge(array('limit' => 1), $options)));
    }

    public function getRandomItems($options = array())
    {
        // apply defaults
        $options = array_merge(array(
            'contextClass' => false
            ,'conditions' => false
            ,'limit' => false
        ), $options);

        $where[] = sprintf('`%s` = %u', TagItem::getColumnName('TagID'), $this->ID);

        if ($options['contextClass']) {
            $where[] = sprintf('`%s` = "%s"', TagItem::getColumnName('ContextClass'), $options['contextClass']);
        }

        return TagItem::instantiateRecords(DB::allRecords(
            'SELECT * FROM `%s` WHERE (%s) ORDER BY rand() %s'
            , array(
                TagItem::$tableName
                , join(') AND (', $where)
                , $options['limit'] ? sprintf('LIMIT %u', $options['limit']) : ''
            )
        ));
    }


    public function getItems($options = array())
    {
    }

    public function getItemsByClass($class, $options = array())
    {
        // apply defaults
        $options = array_merge(array(
            'conditions' => false
            ,'order' => false
            ,'limit' => is_numeric($options) ? $options : false
            ,'offset' => 0
            ,'overlayTag' => false
            ,'calcFoundRows' => false
        ), $options);

        // build TagItem query
        $tagWhere = array();
        $tagWhere[] = sprintf('`%s` = %u', TagItem::getColumnName('TagID'), $this->ID);
        $tagWhere[] = sprintf('`%s` = "%s"', TagItem::getColumnName('ContextClass'), DB::escape($class::getStaticRootClass()));

        $tagQuery = sprintf(
            'SELECT ContextID FROM `%s` TagItem WHERE (%s)'
            , TagItem::$tableName
            , count($tagWhere) ? join(') AND (', $tagWhere) : '1'
            , ($options['limit'] ? sprintf('LIMIT %u', $options['limit']) : '')
        );

        if (!empty($options['overlayTag'])) {
            if (!is_object($OverlayTag = $options['overlayTag']) && !$OverlayTag = Tag::getByHandle($options['overlayTag'])) {
                throw new Exception('Overlay tag not found');
            }

            $tagQuery .= sprintf(
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

        // built class table query
        if ($options['conditions']) {
            if (!is_array($options['conditions'])) {
                $options['conditions'] = array($options['conditions']);
            }

            $classWhere = $class::_mapConditions($options['conditions']);
        } else {
            $classWhere = array();
        }

        // return objects
        $classQuery = sprintf(
            'SELECT %s'
            .' Content.*'
            .' FROM (%s) TagItem'
            .' JOIN `%s` Content ON (Content.ID = TagItem.ContextID)'
            .' WHERE (%s)'
            , $options['calcFoundRows'] ? 'SQL_CALC_FOUND_ROWS' : ''
            , $tagQuery                                                 // tag_items query
            , $class::$tableName                                        // item's table name
            , count($classWhere) ? join(') AND (', $classWhere) : '1'   // optional where clause
        );


        if ($options['order']) {
            $classQuery .= ' ORDER BY '.join(',', $class::_mapFieldOrder($options['order']));
        }

        if ($options['limit']) {
            $classQuery .= sprintf(' LIMIT %u,%u', $options['offset'], $options['limit']);
        }

        return $class::instantiateRecords(DB::allRecords($classQuery));
    }

    public static function getTagsString($tags, $prefix = null)
    {
        if ($prefix) {
            $tags = array_filter($tags, function($Tag) use ($prefix) {
                return $Tag->HandlePrefix == $prefix;
            });
        }

        return implode(', ', array_map(function($Tag) {
            return $Tag->Title;
        }, $tags));
    }

    public static function getAllTitles()
    {
        return array_map(function($Tag) {
            return $Tag->Title;
        }, static::getAll());
    }

    public static function filterTagsByPrefix(array $tags, $prefix)
    {
        return array_filter($tags, function($Tag) use ($prefix) {
            return $Tag->HandlePrefix == $prefix;
        });
    }

    public function getReadableItems()
    {
        $items = array();

        foreach ($this->Items AS $item) {
            try {
                if (!$item->Context) {
                    continue;
                }

                $items[] = $item;
            } catch (UserUnauthorizedException $e) {
                continue;
            }
        }

        return $items;
    }
}
