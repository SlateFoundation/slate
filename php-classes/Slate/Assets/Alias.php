<?php

namespace Slate\Assets;

use DeltaActivity;

class Alias extends \ActivityRecord
{
    // ActiveRecord configuration
    public static $tableName = 'aliases';
    public static $singularNoun = 'alias';
    public static $pluralNoun = 'aliases';

    // the lowest-level class in your table requires these lines,
    // they can be manipulated via config files to plug in same-table subclasses
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    public static $searchConditions = [
        'Identifier' => [
            'qualifiers' => ['any'],
            'points' => 2,
            'sql' => 'Identifier LIKE "%%%s%%"'
        ]
    ];

    public static $fields = [
        'Type' => [
            'length' => '16'
        ],
        'Identifier',
        'ObjectClass' => 'string',
        'ObjectID' => 'uint'
    ];

    public static $indexes = [
        'TypeIdentifier' => [
            'unique' => true,
            'fields' => ['Type', 'Identifier']
        ],
        'Alias' => [
            'unique' => true,
            'fields' => ['Type', 'ObjectClass', 'ObjectID']
        ]
    ];

    public static $relationships = [
        'Object' => [
            'type' => 'context-parent',
            'classField' => 'ObjectClass',
            'local' => 'ObjectID'
        ]
    ];

    public static $dynamicFields = [
        'Object'
    ];

#    public static $deltaRelationFields = array(
#        'ObjectID' => array(
#            'classField' => 'ObjectClass'
#            ,'displayKey' => 'Object'
#            ,'displayField' => 'Name'
#        )
#    );

    public static function getByIdentifier($identifier, $type = null)
    {
        $where = [];

        if ($type) {
            $where['Type'] = $type;
        }

        $where['Identifier'] = $identifier;

        return static::getByWhere($where);
    }

    public function saveDeltaActivity($wasPhantom = false, $wasDirty = false)
    {
        if ($wasPhantom) {
            $Activity = DeltaActivity::publish($this, 'create', $GLOBALS['Session']->Person, $this->getData());
        } else if ($wasDirty) {
            $delta = [];

            foreach ($this->_originalValues as $key => $value) {
                $delta[$key == 'Identifier' ? $this->Type : $key]['before'] = $value;
                $delta[$key == 'Identifier' ? $this->Type : $key]['after'] = $this->getValue($key);

                if ($key == 'Identifier') {
                    $delta[$this->Type]['keyName'] = $key;
                }
            }
            $Activity = DeltaActivity::publish($this, 'update', $GLOBALS['Session']->Person, $delta);
        }
    }
}