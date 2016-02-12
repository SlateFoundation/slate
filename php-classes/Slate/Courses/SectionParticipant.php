<?php

namespace Slate\Courses;

class SectionParticipant extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'course_section_participants';
    public static $singularNoun = 'course participant';
    public static $pluralNoun = 'course participants';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    public static $fields = [
        'CourseSectionID' => [
            'type' => 'integer'
            ,'unsigned' => true
        ]
        ,'PersonID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        ]
        ,'Role' => [
            'type' => 'enum'
            ,'values' => ['Observer','Student','Assistant','Teacher']
        ]
        ,'StartDate' => [
            'type' => 'timestamp'
            ,'notnull' => false
        ]
        ,'EndDate' => [
            'type' => 'timestamp'
            ,'notnull' => false
        ]
    ];

    public static $indexes = [
        'Participant' => [
            'fields' => ['CourseSectionID','PersonID']
            ,'unique' => true
        ]
    ];

    public static $relationships = [
        'Section' => [
            'type' => 'one-one'
            ,'class' => 'Slate\\Courses\\Section'
            ,'local' => 'CourseSectionID'
        ]
        ,'Person' => [
            'type' => 'one-one'
            ,'class' => 'Person'
        ]
    ];

    public static $dynamicFields = [
        'Section'
        ,'Person'
    ];

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

    public static function create($values = [], $save = false)
    {
        try {
            $Participant = parent::create($values, $save);
        } catch (\DuplicateKeyException $e) {
            $Participant = static::getByWhere([
                'CourseSectionID' => $values['Section'] ? $values['Section']->ID : $values['SectionID']
                ,'PersonID' => $values['Person'] ? $values['Person']->ID : $values['PersonID']
            ]);

            if (!empty($values['Role'])) {
                $Participant->Role = $values['Role'];
            }

            if ($save) {
                $Participant->save();
            }
        }

        return $Participant;
    }
}