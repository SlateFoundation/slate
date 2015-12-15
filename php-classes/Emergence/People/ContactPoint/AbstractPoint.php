<?php

namespace Emergence\People\ContactPoint;

use Emergence\People\Person;

abstract class AbstractPoint extends \VersionedRecord implements IContactPoint
{
    public static $personPrimaryField;
    public static $defaultLabel;
    public static $sortWeight = 0;

    protected static $_dataLoaded;

    // VersionedRecord configuration
    public static $historyTable = 'history_contact_points';

    // ActiveRecord configuration
    public static $tableName = 'contact_points';
    public static $singularNoun = 'contact point';
    public static $pluralNoun = 'contact points';
    public static $collectionRoute = '/contact-points';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = [
        'Emergence\People\ContactPoint\Email'
        ,'Emergence\People\ContactPoint\Phone'
        ,'Emergence\People\ContactPoint\Postal'
        ,'Emergence\People\ContactPoint\Network'
        ,'Emergence\People\ContactPoint\Link'
    ];

    public static $searchConditions = [
        'PersonID' => [
            'qualifiers' => ['any', 'personid']
            ,'points' => 2
            ,'sql' => 'PersonID=%u'
        ]
    ];

    public static $fields = [
        'PersonID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        ]
        ,'Label' => [
            'type' => 'string'
            ,'notnull' => false
        ]
        ,'Data' => [
            'type' => 'clob'
        ]
    ];

    public static $relationships = [
        'Person' => [
            'type' => 'one-one'
            ,'class' => 'Person'
        ]
    ];

    public static $dynamicFields = [
        'Person',
        'String' => [
            'method' => 'toString'
        ],
        'Primary' => [
            'method' => 'isPrimary'
        ]
    ];


    public static function getTemplates()
    {
        $config = static::aggregateStackedConfig('templates');

        foreach ($config AS $label => &$options) {
            if (is_string($options)) {
                $options = [
                    'class' => $options
                ];
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
    public function __construct($record = [], $isDirty = false, $isPhantom = null)
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
            $newDefault = static::getByWhere([
                'Class' => $this->Class
                ,'PersonID' => $this->PersonID
            ], [
                'order' => ['ID' => 'DESC']
            ]);

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

    public static function getByString($string, $conditions = [], $options = [])
    {
        $conditions['Data'] = static::fromString($string)->serialize();

        return static::getByWhere($conditions, $options);
    }

    public static function getAllByString($string, $conditions = [], $options = [])
    {
        $conditions['Data'] = static::fromString($string)->serialize();

        return static::getAllByWhere($conditions, $options);
    }


    // convenient accessors
    public static function getByPerson(Person $Person, $conditions = [])
    {
        $conditions['PersonID'] = $Person->ID;

        return static::getByWhere($conditions);
    }

    public static function getByLabel(Person $Person, $label)
    {
        return static::getByWhere([
            'PersonID' => $Person->ID
            ,'Label' => $label
        ]);
    }

    public static function getByClass(Person $Person, $class = false)
    {
        return static::getByWhere([
            'PersonID' => $Person->ID
            ,'Class' => $class ? $class : get_called_class()
        ]);
    }
}