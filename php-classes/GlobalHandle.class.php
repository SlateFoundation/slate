<?php


class GlobalHandle extends ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'handles';
    public static $singularNoun = 'handle';
    public static $pluralNoun = 'handles';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);

    public static $fields = array(
        'ContextClass' => array(
            'type' => 'string'
            ,'notnull' => false
        )
        ,'ContextID' => array(
            'type' => 'integer'
            ,'notnull' => false
        )
        ,'Handle' => array(
            'unique' => true
        )
        ,'Type' => array(
            'type' => 'enum'
            ,'values' => array('Alias', 'Reserve')
            ,'default' => 'Alias'
        )
    );

    public static $relationships = array(
        'Context' => array(
            'type' => 'context-parent'
        )
    );

    public static function createAlias(ActiveRecord $Context, $handle = false)
    {
        if ($handle) {
            $handle = HandleBehavior::getUniqueHandle(__CLASS__, $handle);
        } else {
            $handle = HandleBehavior::generateRandomHandle(__CLASS__, 4);
        }

        return static::create(array(
            'Handle' => $handle
            ,'Type' => 'Alias'
            ,'Context' => $Context
        ), !$Context->isPhantom);
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        $this->_validator->validate(array(
            'field' => 'Type'
            ,'validator' => 'selection'
            ,'choices' => self::$fields['Type']['values']
            ,'required' => false
        ));

        $this->_validator->validate(array(
            'field' => 'Handle'
            ,'required' => false
            ,'validator' => 'handle'
            ,'errorMessage' => 'URL handle can only contain letters, numbers, hyphens, and underscores'
        ));

        if ($this->Type == 'Alias' && (!$this->Context || !is_a($this->Context, 'ActiveRecord'))) {
            $this->_validator->addError('Context', 'Context required to create alias handle');
        }

        // check handle uniqueness
        if ($this->isDirty && !$this->_validator->hasErrors('Handle') && $this->Handle) {
            $ExistingRecord = static::getByHandle($this->Handle);

            if ($ExistingRecord && ($ExistingRecord->ID != $this->ID)) {
                $this->_validator->addError('Handle', 'URL already registered');
            }
        }


        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
    {
        // set handle
        if (!$this->Handle) {
            $this->Handle = HandleBehavior::generateRandomHandle($this, 4);
        }

        // update PK
        if (!$this->ContextID && $this->Context && !$this->Context->isPhantom) {
            $this->ContextID = $this->Context->ID;
        }

        // call parent
        parent::save($deep);
    }
}