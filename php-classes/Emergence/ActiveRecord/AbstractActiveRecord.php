<?php

namespace Emergence\ActiveRecord;

use Inflector;

abstract class AbstractActiveRecord implements ActiveRecordInterface
{
    use \Emergence\Classes\StackedConfigTrait;
    use \Emergence\Classes\SubclassesConfigTrait;

    // static configuration
    public static $singularNoun = 'record';
    public static $pluralNoun = 'records';
    public static $collectionRoute = null;

    public static $behaviors = [
        Behaviors\Eventable::class
    ];

    public static $fields = [
        'id' => [
            'type' => 'integer',
            'unsigned' => true,
            'autoIncrement' => true,
            'includeInSummary' => true
        ],
        'class' => [
            'type' => 'enum',
            'null' => false,
            'values' => []
        ]
    ];

    public static $fieldDefaults = [
        'type' => 'string'
    ];

    public static $fieldHandlers = [
        Fields\Integer::class,
        Fields\String::class,
        Fields\Text::class => [
            'foo' => 'bar',
            'boo' => 'baz'
        ],
        Fields\Enum::class,
        Fields\Timestamp::class,
        Fields\Object::class
    ];



    // static configuration getters
    public static function getSingularNoun()
    {
        return static::$singularNoun;
    }

    public static function getPluralNoun()
    {
        return static::$pluralNoun;
    }

    public static function getNoun($count)
    {
        return $count == 1 ? static::getSingularNoun() : static::getPluralNoun();
    }

    public static function getCollectionRoute()
    {
        return $collectionRoute;
    }

    public static function getFields()
    {
        return static::getStackedConfig('fields');
    }

    public static function getField($name)
    {
        return static::getStackedConfig('fields', $name);
    }

    public static function hasField($name)
    {
        return (boolean)static::getStackedConfig('fields', $name);
    }


    // static instance getters
    public static function getById($id, array $options = [])
    {
        return static::getByField('id', $id, $options);
    }

    public static function getByHandle($handle, array $options = [])
    {
        return static::getByField(static::hasField('handle') ? 'handle' : 'id', $handle, $options);
    }


    // static collection getters



    // static configuration management
    public static function getBehaviors()
    {
        return static::getStackedConfig('behaviors');
    }

    public static function getBehavior($name)
    {
        return static::getStackedConfig('behaviors', $name);
    }

    protected static function initBehaviors(array $config)
    {
        $behaviors = [];
        foreach ($config AS $key => $value) {
            if (!$value) {
                if (is_string($key) && array_key_exists($key, $behaviors)) {
                    unset($behaviors[$key]);
                }

                continue;
            }

            if (is_string($value)) {
                $value = ['class' => $value];
            }

            if (!is_string($key)) {
                $key = $value['class'];
            } elseif (empty($value['class'])) {
                $value['class'] = $key;
            }

            $behaviors[$key] = $value;
        }

        return $behaviors;
    }

    protected static function executeBehaviors($method, array $arguments)
    {
        $class = get_called_class();

        foreach (static::getBehaviors() AS $behavior) {
            if (method_exists($behavior['class'], $method)) {
                call_user_func_array([$behavior['class'], $method], [&$arguments, &$behavior, $class]);
            }
        }
    }

    protected static function initFields(array $config)
    {
        static::executeBehaviors('beforeInitFields', [
            'config' => &$config
        ]);

        $fields = [];

        // apply defaults to field definitions
        foreach ($config AS $field => $options) {
            if (!$options) {
                continue;
            }

            if (is_string($field)) {
                $fields[$field] = static::initField($field, is_array($options) ? $options : ['type' => $options]);
            } elseif (is_string($options)) {
                $field = $options;
                $fields[$field] = static::initField($field);
            }
        }

        static::executeBehaviors('afterInitFields', [
            'config' => &$config,
            'fields' => &$fields
        ]);

        return $fields;
    }

    protected static function initField($field, array $options = [])
    {
        // backwards compatibility for deprecated options
        if (isset($options['notnull'])) {
            if (!isset($options['null'])) {
                $options['null'] = !$options['notnull'];
            }

            unset($options['notnull']);
        }

        if (isset($options['autoincrement'])) {
            if (!isset($options['autoIncrement'])) {
                $options['autoIncrement'] = $options['autoincrement'];
            }

            unset($options['autoincrement']);
        }

        if (isset($options['excludeFromData'])) {
            if (!isset($options['excludeFromValues'])) {
                $options['excludeFromValues'] = $options['excludeFromData'];
            }

            unset($options['excludeFromData']);
        }


        // apply defaults
        $options = array_merge([
            'type' => null,
            'primary' => null,
            'unique' => null,
            'autoIncrement' => null,
            'null' => array_key_exists('default', $options) && $options['default'] === null ? true : false,
            'default' => null
        ], static::$fieldDefaults, ['columnName' => $field], $options);

        if ($field == 'class') {
            // apply Class enum values
            $options['values'] = static::getStaticSubClasses();
        }

        if ($options['autoincrement']) {
            $options['primary'] = true;
        }

        if (empty($options['label'])) {
            $options['label'] = Inflector::labelIdentifier($field);
        }


        // apply fieldHandler
        if (!empty($options['fieldHandler'])) {
            if (is_string($options['fieldHandler'])) {
                $options['fieldHandler'] = ['class' => $options['fieldHandler']];
            }
        } elseif (!empty($options['type'])) {
            $options['fieldHandler'] = static::getStackedConfig('fieldHandlers', $options['type']);

            if (!$options['fieldHandler']) {
                throw new \Exception("No field handler registered for type '$options[type]'");
            }
        }
        
        if (!empty($options['fieldHandler'])) {
            $options['fieldHandler']['class']::initOptions($options);
        }

        return $options;
    }

    public static function addField($name, $options)
    {
        $options = static::initField($name, $options);

        static::getStackedConfig('fields')[$name] = $options;

        return $options;
    }

    /**
     * Supported syntaxes:
     *  $fieldHandlers = [
     *      \Emergence\ActiveRecord\Fields\Integer::class,
     *      'superint' => \Emergence\ActiveRecord\Fields\Integer::class,
     *      [
     *          'aliases' => ['bonusint', 'deluxeint'],
     *          'class' => \Emergence\ActiveRecord\Fields\Integer::class,
     *      ],
     *      'extrabigint' => [
     *          'aliases' => ['jumboint'],
     *          'class' => \Emergence\ActiveRecord\Fields\Integer::class
     *      ],
     *      \Emergence\ActiveRecord\Fields\Integer::class => [
     *          'aliases' => ['uberint']
     *      ]
     *  ]
     */
    protected static function initFieldHandlers(array $config)
    {
        $fieldHandlers = [];

        // apply defaults to field definitions
        foreach ($config AS $key => $value) {
            if (!$value) {
                continue;
            }

            $config = is_array($value) ? $value : [];

            if (is_string($value)) {
                $config = [
                    'class' => $value
                ];
            } else {
                $config = $value;
            }

            $aliases = !empty($config['aliases']) ? $config['aliases'] : [];
            unset($config['aliases']);

            if (is_string($key)) {
                if (empty($config['class'])) {
                    $config['class'] = $key;
                } else {
                    $aliases[] = $key;
                }
            }

            if (!count($aliases)) {
                $aliases = $config['class']::getAliases();
            }

            foreach ($aliases AS $alias) {
                $fieldHandlers[$alias] = $config;
            }
        }

        return $fieldHandlers;
    }

    // instance members
    protected $packedData;
    protected $unpackedData;
    protected $phantom;
    protected $dirty;
    protected $valid;
    protected $new;
    protected $destroyed;


    // magic methods
    public function __construct(array $data = [], array $options = [])
    {
        $this->phantom = isset($options['phantom']) ? $options['phantom'] : empty($data);
        $this->dirty = $this->phantom || !empty($options['dirty']);
        $this->valid = isset($options['valid']) ? $options['valid'] : null;
        $this->new = !empty($options['new']);
        $this->destroyed = !empty($options['destroyed']);

        if (!isset($options['packed']) || $options['packed'] == true) {
            $this->packedData = $data;
            $this->unpackedData = [];
        } else {
            $this->packedData = [];
            $this->unpackedData = $data;
        }
    }


    // lifecycle state setters
    public function setPhantom($phantom)
    {
        if ($this->phantom != $phantom) {
            $this->updatePhantom($phantom);
        }
    }

    public function setDirty($dirty)
    {
        if ($this->dirty != $dirty) {
            $this->updateDirty($dirty);
        }
    }

    public function setValid($valid)
    {
        if ($this->valid != $valid) {
            $this->updateValid($valid);
        }
    }

    public function setNew($new)
    {
        if ($this->new != $new) {
            $this->updateNew($new);
        }
    }

    public function setDestroyed($destroyed)
    {
        if ($this->destroyed != $destroyed) {
            $this->updateDestroyed($destroyed);
        }
    }


    // lifecycle state update handlers
    protected function updatePhantom($phantom)
    {
        $this->phantom = $phantom;

        if (!$phantom) {
            $this->setNew(true);
            $this->setDestroyed(false);
        }
    }

    protected function updateDirty($dirty)
    {
        $this->dirty = $dirty;

        if ($dirty) {
            $this->valid = null;
        }
    }

    protected function updateValid($valid)
    {
        $this->valid = $valid;
    }

    protected function updateNew($new)
    {
        $this->new = $new;

        if ($new) {
            $this->setPhantom(false);
            $this->setDirty(false);
        }
    }

    protected function updateDestroyed($destroyed)
    {
        $this->destroyed = $destroyed;

        if ($destroyed) {
            $this->setPhantom(true);
        }
    }


    // instance methods
    public function getValue($name, array $options = null)
    {
        if (array_key_exists($name, $this->unpackedData)) {
            return $this->unpackedData[$name];
        }

        if (!$options) {
            $options = static::getField($name);
        }

        $value = array_key_exists($name, $this->packedData) ? $this->packedData[$name] : null;

        if (!empty($options['fieldHandler'])) {
            $value = $options['fieldHandler']['class']::unpack($value, $options);
        }

        return $this->unpackedData[$name] = $value;
    }

    public function getValues(array $options = [])
    {
        $values = [];

        foreach (static::getFields() AS $fieldName => $fieldOptions) {
            if (!empty($fieldOptions['excludeFromValues'])) {
                continue;
            }

            $values[$fieldName] = $this->getValue($fieldName, $fieldOptions);
        }

        return $values;
    }
}
