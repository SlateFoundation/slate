<?php

namespace Slate\Integrations;

class SynchronizationMapping extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'synchronization_mappings';
    public static $singularNoun = 'synchronization mapping';
    public static $pluralNoun = 'synchronization mappings';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);

    public static $fields = array(
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

    public static $relationships = array(
        'Context' => array(
            'type' => 'context-parent'
        )
    );

    public static $indexes = array(
        'Context' => array(
            'type' => 'context-parent'
        )
        ,'Mapping' => array(
            'fields' => array('ContextClass', 'ExternalSource', 'ExternalKey', 'ExternalIdentifier')
            ,'unique' => true
        )
    );

    public static function create($values = array(), $save = false)
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