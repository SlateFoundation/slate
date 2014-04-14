<?php

namespace Slate\Integrations;

class SynchronizationMapping extends \ActiveRecord
{
    // ActiveRecord configuration
    static public $tableName = 'synchronization_mappings';
    static public $singularNoun = 'synchronization mapping';
    static public $pluralNoun = 'synchronization mappings';

    // required for shared-table subclassing support
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array(__CLASS__);

    static public $fields = array(
        'ContextClass' => array(
            'type' => 'enum'
            ,'values' => array('Course', 'CourseSection', 'Person', 'CourseSectionParticipant')
        )
        ,'ContextID' => 'uint'
        ,'MappingSource' => array(
            'type' => 'enum'
            ,'values' => array('Creation', 'Matching', 'Manual')
        )
        ,'ExternalSource' => array(
            'type' => 'string'
            ,'length' => 25
        )
        ,'ExternalKey' => array(
            'type' => 'string'
            ,'length' => 25
        )
        ,'ExternalIdentifier' => array(
            'type' => 'string'
            ,'length' => 25
        )
    );

    static public $relationships = array(
        'Context' => array(
            'type' => 'context-parent'
        )
    );

    static public $indexes = array(
        'Context' => array(
            'type' => 'context-parent'
        )
        ,'Mapping' => array(
            'fields' => array('ContextClass', 'ExternalSource', 'ExternalKey', 'ExternalIdentifier')
            ,'unique' => true
        )
    );

    static public function create($values = array(), $save = false)
    {
        try {
            $Mapping = parent::create($values, $save);
        } catch (\DuplicateKeyException $e) {
            $Mapping = static::getByWhere(array(
                'ContextClass' => $values['Context'] ? $values['Context']->getRootClass() : $values['ContextClass']
                ,'ExternalSource' => $values['ExternalSource']
                ,'ExternalKey' => $values['ExternalKey']
                ,'ExternalIdentifier' => $values['ExternalIdentifier']
            ));

            $Mapping->ContextID = $values['Context'] ? $values['Context']->ID : $values['ContextID'];

            if ($save) {
                $Mapping->save();
            }
        }

        return $Mapping;
    }
}