<?php

namespace Slate\Courses;

class SectionParticipant extends \ActiveRecord
{
    // ActiveRecord configuration
    static $tableName = 'course_section_participants';
    public static $singularNoun = 'course participant';
    public static $pluralNoun = 'course participants';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);

    static $fields = array(
        'CourseSectionID' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )
        ,'PersonID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        )
        ,'Role' => array(
            'type' => 'enum'
            ,'values' => array('Observer','Student','Assistant','Teacher')
        )
        ,'StartDate' => array(
            'type' => 'timestamp'
            ,'notnull' => false
        )
        ,'EndDate' => array(
            'type' => 'timestamp'
            ,'notnull' => false
        )
    );

    public static $indexes = array(
        'Participant' => array(
            'fields' => array('CourseSectionID','PersonID')
            ,'unique' => true
        )
    );

    static $relationships = array(
        'Section' => array(
            'type' => 'one-one'
            ,'class' => 'Slate\\Courses\\Section'
            ,'local' => 'CourseSectionID'
        )
        ,'Person' => array(
            'type' => 'one-one'
            ,'class' => 'Person'
        )
    );

    public static $dynamicFields = array(
        'Section'
        ,'Person'
    );
    
    public static $validators = [
        'CourseSectionID' => [
            'validator' => 'number',
            'min' => 1
        ],
        'PersonID' => [
            'validator' => 'number',
            'min' => 1
        ]
    ];

    public static function create($values = array(), $save = false)
    {
        try {
            $Participant = parent::create($values, $save);
        } catch (\DuplicateKeyException $e) {
            $Participant = static::getByWhere(array(
                'CourseSectionID' => $values['Section'] ? $values['Section']->ID : $values['SectionID']
                ,'PersonID' => $values['Person'] ? $values['Person']->ID : $values['PersonID']
            ));

            if ($values['Role']) {
                $Participant->Role = $values['Role'];
            }

            if ($save) {
                $Participant->save();
            }
        }

        return $Participant;
    }

}