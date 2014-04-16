<?php

namespace Slate\Courses;

use HandleBehavior;

class Section extends \VersionedRecord
{
    // VersionedRecord configuration
    static public $historyTable = 'history_course_sections';

    // ActiveRecord configuration
    static public $tableName = 'course_sections';
    static public $singularNoun = 'course section';
    static public $pluralNoun = 'course sections';

    // required for shared-table subclassing support
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array(__CLASS__);
    static public $collectionRoute = '/sections';

    static public $searchConditions = array(
        'Code' => array(
            'qualifiers' => array('any','code')
            ,'points' => 2
            ,'sql' => 'Code LIKE "%%%s%%"'
        )
    );

    static public $fields = array(
        'CourseID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        )
        ,'Title' => array(
            'fulltext' => true
            ,'notnull' => true
        )
        ,'Handle' => array(
            'unique' => true
        )
        ,'Code' => array(
            'unique' => true
        )
        ,'Status' => array(
            'type' => 'enum'
            ,'values' => array('Hidden','Live','Deleted')
            ,'default' => 'Live'
        )
        ,'Notes' => array(
            'type' => 'clob'
            ,'fulltext' => true
            ,'notnull' => false
        )
        ,'StudentsCapacity' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        )
        ,'TermID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        )
        ,'ScheduleID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        )
        ,'LocationID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        )
    );


    static public $relationships = array(
        'Course' => array(
            'type' => 'one-one'
            ,'class' => 'Slate\\Courses\\Course'
        )
        ,'Term' => array(
            'type' => 'one-one'
            ,'class' => 'Slate\\Term'
        )
        ,'Schedule' => array(
            'type' => 'one-one'
            ,'class' => 'Slate\\Courses\\Schedule'
        )
        ,'Location' => array(
            'type' => 'one-one'
            ,'class' => 'Emergence\\Locations\\Location'
        )
        ,'Participants' => array(
            'type' => 'many-many'
            ,'class' => 'Person'
            ,'linkClass' => 'Slate\\Courses\\SectionParticipant'
            ,'linkLocal' => 'CourseSectionID'
        )
        ,'Instructors' => array(
            'type' => 'many-many'
            ,'class' => 'Person'
            ,'linkClass' => 'Slate\\Courses\\SectionParticipant'
            ,'linkLocal' => 'CourseSectionID'
            ,'conditions' => array('Link.Role = "Instructor"')
        )
        ,'Students' => array(
            'type' => 'many-many'
            ,'class' => 'Person'
            ,'linkClass' => 'Slate\\Courses\\SectionParticipant'
            ,'linkLocal' => 'CourseSectionID'
            ,'conditions' => array('Link.Role = "Student"')
        )
        ,'Mappings' => array(
            'type' => 'context-children'
            ,'class' => 'Slate\Integrations\SynchronizationMapping'
            ,'contextClass' => __CLASS__
        )
    );

    static public $dynamicFields = array(
        'Course'
        ,'Term'
        ,'Schedule'
        ,'Location'
    );

    static public $sorters = array(
        'CourseTitle' => array(__CLASS__, 'sortCourseTitle')
    );


    static public function sortCourseTitle($dir, $name)
    {
        return '(SELECT Course.Title FROM courses Course WHERE Course.ID = CourseSection.CourseID) ' . $dir;
    }

    static public function getByHandle($handle)
    {
        return static::getByField('Handle', $handle, true);
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        // implement handles
        HandleBehavior::onValidate($this, $this->_validator);

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true, $createRevision = true)
    {
        // set title
        if (!$this->Title) {
            $this->Title = $this->Course->Title;
        }

        // implement handles
        HandleBehavior::onSave($this);

        // generate short code
        if (!$this->Code) {
            $this->Code = static::getUniqueHandle($this->Course->Code, array(
                'handleField' => 'Code'
                ,'format' => '%s-%03u'
                ,'alwaysSuffix' => true
            ));
        }

        // call parent
        parent::save($deep, $createRevision);
    }

    static public function getFromHandle($handle, $autoCreate = true)
    {
        $Course = false;

        if (is_numeric($handle)) {
            $Course = static::getByField('Title', $handle, true);
        }

        if (!$Course) {
            $Course = static::getByField('Handle', $handle, true);
        }

        if (!$Course) {
            $Course = static::getByField('ID', $handle, true);
        }


        return $Course;
    }

    static public function assignCourses($personID, $courses, $role='Student')
    {
        $assignedCourses = array();

        foreach ($courses AS $courseTitle) {
            if (!$courseTitle) {
                continue;
            }

            if ($Course = static::getFromHandle($courseTitle)) {
                $Course->assignParticipant($personID, $role);
                $assignedCourses[] = $Course;
            }
        }

        return $assignedCourses;
    }

    public function assignParticipant($personID, $role)
    {
        $participantData = array(
            'CourseSectionID' => $this->ID
            ,'PersonID' => $personID
            ,'role' => $role
        );

        try {
            return SectionParticipant::create($participantData, true);
        } catch (\DuplicateKeyException $e) {
            return SectionParticipant::getByWhere($participantData);
        }
    }
}