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
    public static $subClasses = array(__CLASS__);

    public static $searchConditions = array(
        'Identifier' => array(
            'qualifiers' => array('any')
            ,'points' => 2
            ,'sql' => 'Identifier LIKE "%%%s%%"'
        )
    );

    public static $fields = array(
        'Type' => array(
            'length' => '16'
        )
        ,'Identifier'
        ,'ObjectClass' => 'string'
        ,'ObjectID' => 'uint'
    );

    public static $indexes = array(
        'TypeIdentifier' => array(
            'unique' => true
            ,'fields' => array('Type', 'Identifier')
        )
        ,'Alias' => array(
            'unique' => true
            ,'fields' => array('Type', 'ObjectClass', 'ObjectID')
        )
    );

    public static $relationships = array(
        'Object' => array(
            'type' => 'context-parent'
            ,'classField' => 'ObjectClass'
            ,'local' => 'ObjectID'
        )
    );
    
    public static $dynamicFields = array(
        'Object'    
    );
    
#    public static $deltaRelationFields = array(
#        'ObjectID' => array(
#            'classField' => 'ObjectClass'
#            ,'displayKey' => 'Object'
#            ,'displayField' => 'Name'
#        )
#    );
    
    public static function getByIdentifier($identifier, $type = null)
    {
        $where = array();

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
			$delta = array();
			
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