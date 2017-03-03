<?php

namespace Slate\Courses;

use HandleBehavior;
use DuplicateKeyException;
use TableNotFoundException;
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
    public static $subClasses = [__CLASS__];

    public static $searchConditions = [
        'Code' => [
            'qualifiers' => ['any','code']
            ,'points' => 3
            ,'sql' => 'Code LIKE "%%%s%%"'
        ],
        'Title' => [
            'qualifiers' => ['any','title']
            ,'points' => 2
            ,'sql' => 'Title LIKE "%%%s%%"'
        ],
        'Teacher' => [
            'qualifiers' => ['teacher']
            ,'callback' => 'getTeacherSearchSql'
        ],
        'Course' => [
            'qualifiers' => ['course']
            ,'callback' => 'getCourseSearchSql'
        ],
        'Department' => [
            'qualifiers' => ['department']
            ,'callback' => 'getDepartmentSearchSql'
        ],
        'Term' => [
            'qualifiers' => ['term']
            ,'callback' => 'getTermSearchSql'
        ],
        'Schedule' => [
            'qualifiers' => ['schedule']
            ,'callback' => 'getScheduleSearchSql'
        ],
        'Location' => [
            'qualifiers' => ['location']
            ,'callback' => 'getLocationSearchSql'
        ]
    ];

    public static $fields = [
        'CourseID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        ]
        ,'Title' => [
            'notnull' => true
        ]
        ,'Code' => [
            'unique' => true
        ]
        ,'Status' => [
            'type' => 'enum'
            ,'values' => ['Hidden','Live','Deleted']
            ,'default' => 'Live'
        ]
        ,'Notes' => [
            'type' => 'clob'
            ,'fulltext' => true
            ,'notnull' => false
        ]
        ,'StudentsCapacity' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        ]
        ,'TermID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        ]
        ,'ScheduleID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        ]
        ,'LocationID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        ]
    ];

    public static $relationships = [
        'Course' => [
            'type' => 'one-one'
            ,'class' => 'Slate\\Courses\\Course'
        ]
        ,'Term' => [
            'type' => 'one-one'
            ,'class' => 'Slate\\Term'
        ]
        ,'Schedule' => [
            'type' => 'one-one'
            ,'class' => 'Slate\\Courses\\Schedule'
        ]
        ,'Location' => [
            'type' => 'one-one'
            ,'class' => 'Emergence\\Locations\\Location'
        ]
        ,'Participants' => [
            'type' => 'one-many'
            ,'class' => 'Slate\\Courses\\SectionParticipant'
            ,'foreign' => 'CourseSectionID'
            ,'order' => 'Role DESC, (SELECT CONCAT(LastName,FirstName) FROM people WHERE people.id = PersonID)'
        ]
        ,'Teachers' => [
            'type' => 'many-many'
            ,'class' => 'Person'
            ,'linkClass' => 'Slate\\Courses\\SectionParticipant'
            ,'linkLocal' => 'CourseSectionID'
            ,'linkForeign' => 'PersonID'
            ,'conditions' => ['Link.Role = "Teacher"']
        ]
        ,'Students' => [
            'type' => 'many-many'
            ,'class' => 'Person'
            ,'linkClass' => 'Slate\\Courses\\SectionParticipant'
            ,'linkLocal' => 'CourseSectionID'
            ,'linkForeign' => 'PersonID'
            ,'conditions' => ['Link.Role = "Student"']
        ]
        ,'Mappings' => [
            'type' => 'context-children'
            ,'class' => 'Emergence\Connectors\Mapping'
            ,'contextClass' => __CLASS__
        ]
    ];

    public static $validators = [
        'Course' => [
            'validator' => 'require-relationship'
            ,'errorMessage' => 'Course must be selected'
        ]
    ];

    public static $dynamicFields = [
        'Course'
        ,'Term'
        ,'Schedule'
        ,'Location'
        ,'Teachers'
        ,'StudentsCount' => [
            'method' => 'getStudentsCount'
        ]
    ];

    public static $sorters = [
        'CourseTitle' => [__CLASS__, 'sortCourseTitle'],
        'CurrentTerm' => [__CLASS__, 'sortCurrentTerm']
    ];


    public static function sortCourseTitle($dir, $name)
    {
        return '(SELECT Course.Title FROM courses Course WHERE Course.ID = CourseSection.CourseID) '.$dir;
    }

    public static function sortCurrentTerm($dir, $name)
    {
        $tableAlias = static::getTableAlias();
        $sortedTermIds = \DB::allValues(
            'ID',

            'SELECT ID '.
            '  FROM `%s` Term'.
            ' ORDER BY ('.
                        'SELECT IF( '.
                            ' Term.StartDate <= NOW() AND Term.EndDate > NOW(), 2, '. // current = 2
                            ' IF ( '.
                                    'Term.EndDate >= NOW(), 1, 0'.  // upcoming = 1, previous = 0
                            ' )'.
                        ' ) '.
            ') DESC',
            [
                \Slate\Term::$tableName
            ]
        );

        // ASC = current, future, past
        // DESC = past, future, current
        return '(FIELD('.$tableAlias.'.TermID, '.join(', ', $sortedTermIds).')) '.$dir;
    }

    public function save($deep = true)
    {
        // set title
        if (!$this->Title) {
            $this->Title = $this->Course->Title;
        }

        // generate short code
        if (!$this->Code) {
            $this->Code = HandleBehavior::getUniqueHandle("\\Slate\\Courses\\Section", $this->Course->Code, [
                'handleField' => 'Code'
                ,'suffixFormat' => '%s-%03u'
                ,'alwaysSuffix' => true
                ,'case' => 'upper'
            ]);
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
        $assignedCourses = [];

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
        $participantData = [
            'CourseSectionID' => $this->ID
            ,'PersonID' => $personID
            ,'role' => $role
        ];

        try {
            return SectionParticipant::create($participantData, true);
        } catch (DuplicateKeyException $e) {
            return SectionParticipant::getByWhere($participantData);
        }
    }

    public function getStudentsCount()
    {
        try {
            return (int)\DB::oneValue(
                'SELECT COUNT(*) FROM `%s` WHERE CourseSectionID = %u AND Role = "Student"'
                ,[
                    SectionParticipant::$tableName
                    ,$this->ID
                ]);
        } catch (TableNotFoundException $e) {
            return 0;
        }
    }

    public function getParticipant($person)
    {
        if ($person instanceof \Emergence\People\IPerson) {
            $person = $person->ID;
        }

        return SectionParticipant::getByWhere([
            'CourseSectionID' => $this->ID,
            'PersonID' => $person
        ]);
    }

    // search SQL generators
    protected static function getTeacherSearchSql($term, $condition)
    {
        $Teacher = \Emergence\People\User::getByUsername($term);

        if (!$Teacher) {
            return 'FALSE';
        }

        try {
            $sectionIds = \DB::allValues(
                'CourseSectionID'
                ,'SELECT CourseSectionID FROM `%s` Participant WHERE Participant.PersonID = %u AND Role = "Teacher"'
                ,[
                    SectionParticipant::$tableName
                    ,$Teacher->ID
                ]
            );
        } catch (TableNotFoundException $e) {
            return 'FALSE';
        }

        if (!count($sectionIds)) {
            return 'FALSE';
        }

        return 'ID IN ('.implode(',', $sectionIds).')';
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

        return 'CourseID IN ('.implode(',', $courseIds).')';
    }

    protected static function getTermSearchSql($term, $condition)
    {
        $Term = \Slate\Term::getByHandle($term);

        if ($Term) {
            return 'TermID IN ('.implode(',', $Term->getRelatedTermIds()).')';
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