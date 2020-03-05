<?php

namespace Slate\Courses;

class SectionParticipant extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'course_section_participants';
    public static $singularNoun = 'course participant';
    public static $pluralNoun = 'course participants';
    public static $collectionRoute = '/section-participants';
    public static $updateOnDuplicateKey = true;

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
        ,'Cohort' => [
            'default' => null
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

    public function getEffectiveStartTimestamp()
    {
        return $this->StartDate ?: $this->Section->Term->getStartTimestamp();
    }

    public function getEffectiveEndTimestamp()
    {
        if (!$time = $this->EndDate) {
            return $this->Section->Term->getEndTimestamp();
        }

        // treat "empty" time component as end of day
        if (date('H:i:s', $time) == '00:00:00') {
            $time += 60*60*24-1;
        }

        return $time;
    }
}
