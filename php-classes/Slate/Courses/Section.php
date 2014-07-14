<?php

namespace Slate\Courses;

use HandleBehavior;
use Slate\Courses\SectionParticipant;

class Section extends \VersionedRecord
{
    // VersionedRecord configuration
    public static $historyTable = 'history_course_sections';

    // ActiveRecord configuration
    public static $tableName = 'course_sections';
    public static $singularNoun = 'course section';
    public static $pluralNoun = 'course sections';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);
    public static $collectionRoute = '/sections';

    public static $searchConditions = array(
        'Code' => array(
            'qualifiers' => array('any','code')
            ,'points' => 2
            ,'sql' => 'Code LIKE "%%%s%%"'
        )
    );

    public static $fields = array(
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


    public static $relationships = array(
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
            ,'linkForeign' => 'PersonID'
        )
        ,'Instructors' => array(
            'type' => 'many-many'
            ,'class' => 'Person'
            ,'linkClass' => 'Slate\\Courses\\SectionParticipant'
            ,'linkLocal' => 'CourseSectionID'
            ,'linkForeign' => 'PersonID'
            ,'conditions' => array('Link.Role = "Instructor"')
        )
        ,'Students' => array(
            'type' => 'many-many'
            ,'class' => 'Person'
            ,'linkClass' => 'Slate\\Courses\\SectionParticipant'
            ,'linkLocal' => 'CourseSectionID'
            ,'linkForeign' => 'PersonID'
            ,'conditions' => array('Link.Role = "Student"')
        )
        ,'Mappings' => array(
            'type' => 'context-children'
            ,'class' => 'Slate\Integrations\SynchronizationMapping'
            ,'contextClass' => __CLASS__
        )
    );

    public static $dynamicFields = array(
        'Course'
        ,'Term'
        ,'Schedule'
        ,'Location'
    );

    public static $sorters = array(
        'CourseTitle' => array(__CLASS__, 'sortCourseTitle')
    );


    public static function sortCourseTitle($dir, $name)
    {
        return '(SELECT Course.Title FROM courses Course WHERE Course.ID = CourseSection.CourseID) ' . $dir;
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
            $this->Code = HandleBehavior::getUniqueHandle("\\Slate\\Courses\\Section", $this->Course->Code, array(
                'handleField' => 'Code'
                ,'format' => '%s-%03u'
                ,'alwaysSuffix' => true
            ));
        }

        // call parent
        parent::save($deep, $createRevision);
    }

    public static function getFromHandle($handle, $autoCreate = true)
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

    public static function assignCourses($personID, $courses, $role='Student')
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