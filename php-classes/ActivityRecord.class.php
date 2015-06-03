<?php

abstract class ActivityRecord extends ActiveRecord
{
    static public $deltaRelationFields = array();
    static public $searchConditions = [];
    
    public static $dynamicFields = array(
        'Stories' => array(
            'getter' => 'getStories'    
        )    
    );
    
	
	public function destroy()
	{
		$Activity = DeltaActivity::create(array(
			'Object' => $this
			,'Actor' => $GLOBALS['Session']->Person
			,'Verb' => 'delete'
			,'Data' => $this->getData()
		), true);
		
		return parent::destroy();
	}

	public function save($deep = true)
	{
		$wasPhantom = $this->isPhantom;
		$wasDirty = $this->isDirty;

		parent::save($deep);
		
        $this->saveDeltaActivity($wasPhantom, $wasDirty);
        
	}
    
    public function saveDeltaActivity($wasPhantom = false, $wasDirty = false)
    {
        if ($wasPhantom) {
    		$Activity = DeltaActivity::publish($this, 'create', $GLOBALS['Session']->Person, $this->getData());
		}
		else if ($wasDirty) {
			$delta = array();
			
			foreach ($this->_originalValues as $key => $value) {				
				$delta[$key]['before'] = $value;
				$delta[$key]['after'] = $this->getValue($key);
			}
            
            if (!empty($delta)) {
                $Activity = DeltaActivity::publish($this, 'update', $GLOBALS['Session']->Person, $delta);    
            }
		}
    }
    
    public function getStories($from = null, $to = null, $options = array(), $conditions = array())
    {
        
        $conditions = $conditions + array('ObjectClass' => $this->Class, 'ObjectID' => $this->ID);
        
        if ($from || $from = $_REQUEST['from']) {
            $from = strtotime($from);
            $conditions[] = sprintf('Created > %s', date("U", DB::escape($from)));
        }
        
        if ($to || $to = $_REQUEST['to']) {
            $to = strtotime($to);
            $conditions[] = sprintf('Created < %s', date("U", DB::escape($to)));
        }
        
        if ($limit = $_REQUEST['limit']) {
            $options['limit'] = DB::escape($limit);
        }
        
        if(empty($options['order'])) {
            $options['order'] = array('ID' => 'DESC');
        }
        
        $stories = Activity::getAllByWhere($conditions, $options);
        
        return JSON::translateObjects($stories, false, array('Media', 'Actor', 'changes'));
    }
}