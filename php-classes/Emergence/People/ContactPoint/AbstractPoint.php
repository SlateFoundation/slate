<?php

namespace Emergence\People\ContactPoint;

use Person;

abstract class AbstractPoint extends \VersionedRecord implements IContactPoint
{
    static public $personPrimaryField;
    static public $defaultLabel;
    static public $sortWeight = 0;

    static protected $_dataLoaded;

    // VersionedRecord configuration
    static public $historyTable = 'history_contact_points';

    // ActiveRecord configuration
    static public $tableName = 'contact_points';
    static public $singularNoun = 'contact point';
    static public $pluralNoun = 'contact points';

    // required for shared-table subclassing support
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array(
        'Emergence\People\ContactPoint\Email'
        ,'Emergence\People\ContactPoint\Phone'
        ,'Emergence\People\ContactPoint\Postal'
        ,'Emergence\People\ContactPoint\Network'
        ,'Emergence\People\ContactPoint\Link'
    );

    static public $searchConditions = array(
        'PersonID' => array(
            'qualifiers' => array('any', 'personid')
            ,'points' => 2
            ,'sql' => 'PersonID=%u'
        )
    );

    static public $fields = array(
        'PersonID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        )
        ,'Label' => array(
            'type' => 'string'
            ,'notnull' => false
        )
        ,'Data' => array(
            'type' => 'clob'
        )
    );

    static public $relationships = array(
        'Person' => array(
            'type' => 'one-one'
            ,'class' => 'Person'
        )
    );
    
    static public $dynamicFields = array(
        'Person',
        'String' => array(
            'method' => 'toString'
        ),
        'Primary' => array(
            'method' => 'isPrimary'
        )
    );
    
    
    public static function getTemplates()
    {
        $config = static::aggregateStackedConfig('templates');
        
        foreach ($config AS $label => &$options) {
            if (is_string($options)) {
                $options = array(
                    'class' => $options
                );
            }
            
            if (!empty($options['alternateLabels'])) {
                foreach ($options['alternateLabels'] AS $alternateLabel) {
                    $config[$alternateLabel] = $options;
                }
                unset($options['alternateLabels']);
            }
        }
        
        return $config;
    }
    
    public function isPrimary()
    {
        return !$this->isPhantom && static::$personPrimaryField && $this->Person->getValue(static::$personPrimaryField) == $this->ID;
    }


    // lifecycle overrides
    function __construct($record = array(), $isDirty = false, $isPhantom = null)
    {
        parent::__construct($record, $isDirty, $isPhantom);
        
        if ($this->Data) {
            $this->unserialize($this->Data);
        }
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);
        
        // synchronize serialized to data field
        $this->Data = $this->serialize();
        
        if (empty($this->Data)) {
            $this->_validator->addError('Data', 'No valid data has been loaded');
        }
        
        if (empty($this->Label) && !static::$defaultLabel) {
            $this->_validator->addError('Label', 'A label is required');
        }
        
        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
	{
        if (empty($this->Label) && static::$defaultLabel) {
            $this->Label = static::$defaultLabel;
        }
        
        $result = parent::save($deep);

        // automatically assign associated person's primary contact point to this one if it is not yet set
        if ($this->Person && static::$personPrimaryField && !$this->Person->getValue(static::$personPrimaryField)) {
            $wasDirty = $this->Person->isDirty;
            $this->Person->setValue(static::$personPrimaryField, $this->ID);

            if (!$wasDirty) {
                $this->Person->save(false);
            }
        }

        return $result;
	}
    
    public function destroy()
    {
        $result = parent::destroy();
        
        // remove or reassign associated person's primary contact point
        if ($result && $this->Person && static::$personPrimaryField && $this->Person->getValue(static::$personPrimaryField) == $this->ID) {
            $newDefault = static::getByWhere(array(
                'Class' => $this->Class
                ,'PersonID' => $this->PersonID
            ), array(
                'order' => array('ID' => 'DESC')
            ));
            
            $wasDirty = $this->Person->isDirty;
            $this->Person->setValue(static::$personPrimaryField, $newDefault ? $newDefault->ID : null);

            if (!$wasDirty) {
                $this->Person->save(false);
            }
        }
        
        return $result;
    }
    
    
    // standard IContactPoint implementations
    public function __toString()
    {
        return $this->toString();
    }

    public static function fromString($string, Person $Person = null, $autoSave = false)
    {
        $instance = new static();
        $instance->loadString((string)$string);

        if ($Person) {
            $instance->Person = $Person;
        }

        if ($autoSave) {
            $instance->save(false);
        }

        return $instance;
    }

    public static function fromSerialized($string, Person $Person = null, $autoSave = false)
    {
        $instance = new static();
        $instance->unserialize($string);

        if ($Person) {
            $instance->Person = $Person;
        }

        if ($autoSave) {
            $instance->save(false);
        }

        return $instance;
    }
    
    public static function getByString($string, $conditions = array(), $options = array())
    {
        $conditions['Data'] = static::fromString($string)->serialize();
        
        return static::getByWhere($conditions, $options);
    }

    public static function getAllByString($string, $conditions = array(), $options = array())
    {
        $conditions['Data'] = static::fromString($string)->serialize();
        
        return static::getAllByWhere($conditions, $options);
    }


    // convenient accessors
    public static function getByPerson(Person $Person, $conditions = array())
    {
        $conditions['PersonID'] = $Person->ID;

        return static::getByWhere($conditions);
    }

    public static function getByLabel(Person $Person, $label)
    {
        return static::getByWhere(array(
            'PersonID' => $Person->ID
            ,'Label' => $label
        ));
    }

    public static function getByClass(Person $Person, $class = false)
    {
        return static::getByWhere(array(
            'PersonID' => $Person->ID
            ,'Class' => $class ? $class : get_called_class()
        ));
    }
}