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
    public static $collectionRoute = '/sections';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);

    public static $searchConditions = array(
        'Code' => array(
            'qualifiers' => array('any','code')
            ,'points' => 3
            ,'sql' => 'Code LIKE "%%%s%%"'
        ),
        'Title' => array(
            'qualifiers' => array('any','title')
            ,'points' => 2
            ,'sql' => 'Title LIKE "%%%s%%"'
        ),
        'Teacher' => array(
            'qualifiers' => array('teacher')
            ,'callback' => 'getTeacherSearchSql'
        ),
        'Course' => array(
            'qualifiers' => array('course')
            ,'callback' => 'getCourseSearchSql'
        ),
        'Department' => array(
            'qualifiers' => array('department')
            ,'callback' => 'getDepartmentSearchSql'
        ),
        'Term' => array(
            'qualifiers' => array('term')
            ,'callback' => 'getTermSearchSql'
        ),
        'Schedule' => array(
            'qualifiers' => array('schedule')
            ,'callback' => 'getScheduleSearchSql'
        ),
        'Location' => array(
            'qualifiers' => array('location')
            ,'callback' => 'getLocationSearchSql'
        )
    );

    public static $fields = array(
        'CourseID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        )
        ,'Title' => array(
            'notnull' => true
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
            'type' => 'one-many'
            ,'class' => 'Slate\\Courses\\SectionParticipant'
            ,'foreign' => 'CourseSectionID'
            ,'order' => 'Role DESC, (SELECT CONCAT(LastName,FirstName) FROM people WHERE people.id = PersonID)'
        )
        ,'Teachers' => array(
            'type' => 'many-many'
            ,'class' => 'Person'
            ,'linkClass' => 'Slate\\Courses\\SectionParticipant'
            ,'linkLocal' => 'CourseSectionID'
            ,'linkForeign' => 'PersonID'
            ,'conditions' => array('Link.Role = "Teacher"')
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
            ,'class' => 'Emergence\Connectors\Mapping'
            ,'contextClass' => __CLASS__
        )
    );

    public static $validators = [
        'Course' => [
            'validator' => 'require-relationship'
            ,'errorMessage' => 'Course must be selected'
        ]
    ];

    public static $dynamicFields = array(
        'Course'
        ,'Term'
        ,'Schedule'
        ,'Location'
        ,'StudentsCount' => array(
            'method' => 'getStudentsCount'
        )
    );

    public static $sorters = array(
        'CourseTitle' => array(__CLASS__, 'sortCourseTitle')
    );


    public static function sortCourseTitle($dir, $name)
    {
        return '(SELECT Course.Title FROM courses Course WHERE Course.ID = CourseSection.CourseID) ' . $dir;
    }

    public function save($deep = true)
    {
        // set title
        if (!$this->Title) {
            $this->Title = $this->Course->Title;
        }

        // generate short code
        if (!$this->Code) {
            $this->Code = HandleBehavior::getUniqueHandle("\\Slate\\Courses\\Section", $this->Course->Code, array(
                'handleField' => 'Code'
                ,'format' => '%s-%03u'
                ,'alwaysSuffix' => true
                ,'case' => 'upper'
            ));
        }

        // call parent
        parent::save($deep);
    }
    
    public function getHandle()
    {
        return $this->Code;
    }

    public static function getByHandle($handle)
    {
        return static::getByCode($handle);
    }

    public static function getByCode($code)
    {
        return static::getByField('Code', $code);
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
    
    public function getStudentsCount()
    {
        return (int)\DB::oneValue(
            'SELECT COUNT(*) FROM `%s` WHERE CourseSectionID = %u AND Role = "Student"'
            ,[
                SectionParticipant::$tableName
                ,$this->ID
            ]);
    }
    
    // search SQL generators
    protected static function getTeacherSearchSql($term, $condition)
    {
        $Teacher = \Emergence\People\User::getByUsername($term);
        
        if (!$Teacher) {
            return 'FALSE';
        }
        
        $sectionIds = \DB::allValues(
            'CourseSectionID'
            ,'SELECT CourseSectionID FROM `%s` Participant WHERE Participant.PersonID = %u AND Role = "Teacher"'
            ,[
                SectionParticipant::$tableName
                ,$Teacher->ID
            ]
        );
        
        if (!count($sectionIds)) {
            return 'FALSE';
        }

        return 'ID IN (' . implode(',', $sectionIds) . ')';
    }

    protected static function getCourseSearchSql($term, $condition)
    {
        $Course = Course::getByCode($term);

        return $Course ? "CourseID = $Course->ID" : 'FALSE';
    }

    protected static function getDepartmentSearchSql($term, $condition)
    {
        $Department = Department::getByHandle($term);
        
        if (!$Department) {
            return 'FALSE';
        }
        
        $courseIds = \DB::allValues(
            'ID'
            ,'SELECT ID FROM `%s` Course WHERE Course.DepartmentID = %u'
            ,[
                Course::$tableName
                ,$Department->ID
            ]
        );
        
        if (!count($courseIds)) {
            return 'FALSE';
        }

        return 'CourseID IN (' . implode(',', $courseIds) . ')';
    }

    protected static function getTermSearchSql($term, $condition)
    {
        $Term = \Slate\Term::getByHandle($term);
        
        if ($Term) {
            return 'TermID IN (' . implode(',', $Term->getRelatedTermIds()) . ')';
        }
        
        return 'FALSE';
    }

    protected static function getScheduleSearchSql($term, $condition)
    {
        $Schedule = Schedule::getByHandle($term);

        return $Schedule ? "ScheduleID = $Schedule->ID" : 'FALSE';
    }

    protected static function getLocationSearchSql($term, $condition)
    {
        $Location = \Emergence\Locations\Location::getByHandle($term);

        return $Location ? "LocationID = $Location->ID" : 'FALSE';
    }
}