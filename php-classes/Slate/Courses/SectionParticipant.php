<?php

namespace Slate\Courses;

class SectionParticipant extends \ActiveRecord
{
    // ActiveRecord configuration
    static $tableName = 'course_section_participants';
    static public $singularNoun = 'course participant';
    static public $pluralNoun = 'course participants';

    // required for shared-table subclassing support
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array(__CLASS__);

    static $fields = array(
        'CourseSectionID' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )
        ,'PersonID' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )
        ,'Role' => array(
            'type' => 'enum'
            ,'values' => array('Observer','Student','Instructor','Administrator')
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

    static public $indexes = array(
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

    static public $dynamicFields = array(
        'Section'
        ,'Person'
    );

    static public function create($values = array(), $save = false)
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