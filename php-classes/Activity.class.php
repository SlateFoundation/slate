<?php

abstract class Activity extends ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'activity';
    public static $singularNoun = 'activity';
    public static $pluralNoun = 'activities';

    // the lowest-level class in your table requires these lines,
    // they can be manipulated via config files to plug in same-table subclasses
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(DeltaActivity::class, CommentActivity::class, MediaActivity::class);
    
    public static $activityMergeHours = 1;

    public static $fields = array(
        'CreatorID' => null

        ,'ActorClass' => array(
            'type' => 'string'
            ,'notnull' => false
        )
        ,'ActorID' => array(
            'type' => 'uint'
            ,'notnull' => false
        )
        ,'Verb' => 'string'
        ,'ObjectClass' => 'string'
        ,'ObjectID' => 'uint'
        ,'Data' => array(
            'type' => 'json'
            ,'notnull' => false
        )
    );

    public static $relationships = array(
        'Actor' => array(
            'type' => 'context-parent'
            ,'local' => 'ActorID'
            ,'classField' => 'ActorClass'
        )
        ,'Object' => array(
            'type' => 'context-parent'
            ,'local' => 'ObjectID'
            ,'classField' => 'ObjectClass'
        )
    );
    
    public static $dynamicFields = array(
        'Actor',
        'Object',
        'changes' => array(
            'getter' => 'getChanges'    
        )
    );

    public static function getAllByObject(ActiveRecord $Object)
    {
        return static::getAllByWhere(array(
            'ObjectClass' => $Object->getRootClass()
            ,'ObjectID' => $Object->ID
        ),array(
            'order' => array('ID' => 'DESC')
        ));
    }

    public static function publish(ActiveRecord $Object, $verb, ActiveRecord $Actor = null, $data = array())
    {  
        return static::create(array(
            'Actor' => $Actor
            ,'Object' => $Object
            ,'ObjectClass' => $Object->Class
            ,'Verb' => $verb
            ,'Data' => $data
        ), true);   
    }
    
 
    public function getChanges()
    {
        
        $data = parent::getData(true);
        
        $className = $this->ObjectClass;
        $relationships = $className::getStackedConfig('relationships');
        $ignoreFields = array('ID', 'Created');
        
        $changes = [];
        
        foreach ($relationships AS $relationship) {
            if (in_array($relationship['type'],  array('one-one', 'context-parent'))) {
                $ignoreFields[] = $relationship['local'];
            }
        }

        if ($this->Verb == 'update') {    
			foreach ($data['Data'] as $key => &$change) {
                if ($change['keyName']) {
                    $keyName = $change['keyName'];
                    unset($change['keyName']);
                } else {
                    $keyName = false;
                }
                
				if (in_array($key, $ignoreFields) || !$recordFieldOptions = $className::getStackedConfig('fields', $keyName ?: $key) ) {
                    continue;
				}
                
                //instantiate change array as object.
                $change = (object) $change;
                $change->property = $keyName ? $key : $recordFieldOptions['label'];
                
				$change->before = array(
					'value' => $change->before
					,'displayValue' => $change->before
				);
				
				$change->after = array(
					'value' => $change->after
					,'displayValue' => $change->after
				);
                
                $changes[] = $change;
			}
		}

        return $changes;
    
    }
}