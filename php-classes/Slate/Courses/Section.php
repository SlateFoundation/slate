<?php

namespace Slate\Courses;

use DB;
use HandleBehavior;
use DuplicateKeyException;
use TableNotFoundException;
use TagItem;

use Emergence\People\IPerson;
use Emergence\People\Person;
use Emergence\People\User;
use Emergence\Locations\Location;
use Emergence\Connectors\Mapping;
use Emergence\CMS\BlogPost;

use Slate\Term;
use Slate\Courses\SectionParticipant;



class Section extends \VersionedRecord
{
    use \Emergence\Connectors\LaunchableTrait;


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
            'default' => null
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
            ,'class' => Course::class
        ]
        ,'Term' => [
            'type' => 'one-one'
            ,'class' => Term::class
        ]
        ,'Schedule' => [
            'type' => 'one-one'
            ,'class' => Schedule::class
        ]
        ,'Location' => [
            'type' => 'one-one'
            ,'class' => Location::class
        ]
        ,'Participants' => [
            'type' => 'one-many'
            ,'class' => SectionParticipant::class
            ,'foreign' => 'CourseSectionID'
            ,'order' => 'Role DESC, (SELECT CONCAT(LastName,FirstName) FROM people WHERE people.id = PersonID)'
        ]
        ,'ActiveTeachers' => [
            'type' => 'many-many'
            ,'class' => Person::class
            ,'linkClass' => SectionParticipant::class
            ,'linkLocal' => 'CourseSectionID'
            ,'linkForeign' => 'PersonID'
            ,'conditions' => [
                'Link.Role = "Teacher"',
                '(Link.StartDate IS NULL OR DATE(Link.StartDate) <= CURRENT_DATE)',
                '(Link.EndDate IS NULL OR DATE(Link.EndDate) >= CURRENT_DATE)'
            ]
        ]
        ,'Teachers' => [
            'type' => 'many-many'
            ,'class' => Person::class
            ,'linkClass' => SectionParticipant::class
            ,'linkLocal' => 'CourseSectionID'
            ,'linkForeign' => 'PersonID'
            ,'conditions' => ['Link.Role = "Teacher"']
        ]
        ,'ActiveStudents' => [
            'type' => 'many-many'
            ,'class' => Person::class
            ,'linkClass' => SectionParticipant::class
            ,'linkLocal' => 'CourseSectionID'
            ,'linkForeign' => 'PersonID'
            ,'conditions' => [
                'Link.Role = "Student"',
                '(Link.StartDate IS NULL OR DATE(Link.StartDate) <= CURRENT_DATE)',
                '(Link.EndDate IS NULL OR DATE(Link.EndDate) >= CURRENT_DATE)'
            ]
        ]
        ,'Students' => [
            'type' => 'many-many'
            ,'class' => Person::class
            ,'linkClass' => SectionParticipant::class
            ,'linkLocal' => 'CourseSectionID'
            ,'linkForeign' => 'PersonID'
            ,'conditions' => ['Link.Role = "Student"']
        ]
        ,'Mappings' => [
            'type' => 'context-children'
            ,'class' => Mapping::class
            ,'contextClass' => __CLASS__
        ]
        ,'BlogPosts' => [
            'type' => 'one-many'
            ,'class' => BlogPost::class
            ,'contextClass' => __CLASS__
            ,'foreign' => 'ContextID'
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
        // TODO: remove this, only for testing
        ,'Tags' => [
          'method' => 'findBlogTags'
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
        $sortedTermIds = DB::allValues(
            'ID',

            'SELECT ID '.
            '  FROM `%s` Term'.
            ' ORDER BY IF('.
            '                Term.StartDate <= CURRENT_DATE AND Term.EndDate > CURRENT_DATE,'.
            '                2, '. // current = 2
            '                IF ('.
            '                       Term.EndDate >= CURRENT_DATE,'.
            '                       1,'. // upcoming = 1
            '                       0'.  // previous = 0
            '                   )'.
            '            ) DESC,'.
            '            ABS(DATEDIFF(Term.StartDate, CURRENT_DATE)) ASC,'.
            '            Term.Left DESC',
            [
                Term::$tableName
            ]
        );

        // ASC = current, future, past
        // DESC = past, future, current
        return 'FIELD('.$tableAlias.'.TermID, '.join(', ', $sortedTermIds).') '.$dir;
    }

    public function save($deep = true)
    {
        // generate short code
        if (!$this->Code) {
            $this->Code = HandleBehavior::getUniqueHandle(static::class, $this->Course->Code, [
                'handleField' => 'Code'
                ,'suffixFormat' => '%s-%03u'
                ,'alwaysSuffix' => true
                ,'case' => 'upper'
            ]);
        }

        // call parent
        parent::save($deep);
    }

    public function getTitle()
    {
        if ($this->Title) {
            return $this->Title;
        }

        // start with course title
        $title = $this->Course->Title;

        // append teachers list
        $teachers = $this->Teachers;

        if (count($teachers)) {
            static $adviseesByTeacher = null;
            if (!$adviseesByTeacher) {
                $adviseesByTeacher = DB::valuesTable(
                    'AdvisorID',
                    'Advisees',
                    'SELECT AdvisorID, COUNT(*) AS Advisees FROM people WHERE GraduationYear >= YEAR(CURRENT_DATE) - 1 GROUP BY AdvisorID'
                );
            }

            usort(
                $teachers,
                function (IPerson $Teacher1, IPerson $Teacher2) use ($adviseesByTeacher) {
                    $advisees1 = @$adviseesByTeacher[$Teacher1->ID];
                    $advisees2 = @$adviseesByTeacher[$Teacher2->ID];

                    if ($advisees1 == $advisees2) {
                        return strcasecmp(
                            "{$Teacher1->LastName}, {$Teacher1->FirstName}",
                            "{$Teacher2->LastName}, {$Teacher2->FirstName}"
                        );
                    }

                    return ($advisees1 > $advisees2) ? -1 : 1;
                }
            );

            $title .= "\xC2\xA0\xC2\xB7 ".implode(
                '/',
                array_map(
                    function (IPerson $Teacher) {
                        return $Teacher->LastName;
                    },
                    $teachers
                )
            );
        }

        // append schedule
        if ($this->Schedule) {
            $title .= "\xC2\xA0\xC2\xB7 {$this->Schedule->Title}";
        }

        return $title;
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
            return (int)DB::oneValue(
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
        if ($person instanceof IPerson) {
            $person = $person->ID;
        }

        return SectionParticipant::getByWhere([
            'CourseSectionID' => $this->ID,
            'PersonID' => $person
        ]);
    }

    public function getCohorts()
    {
        try {
            return \DB::allValues('Cohort', '
                SELECT DISTINCT Cohort FROM `%s`
                WHERE CourseSectionID = %u
                AND Cohort IS NOT NULL
                ORDER BY Cohort
            ', [
                SectionParticipant::$tableName,
                $this->ID
            ]);
        } catch (\TableNotFoundException $e) {
            return [];
        }
    }

    public function findBlogTags()
    {
        return TagItem::getTagsSummary([
            'Class' => BlogPost::class,
            'classConditions' => [
                'ContextClass' => static::getStaticRootClass(),
                'ContextID' => $this->ID
            ]
        ]);
    }

    public function findBlogPosts($conditions, $limit, $offset, $tag)
    {
      $options = [
        'limit' => $limit,
        'offset' => $offset,
        'calcFoundRows' => 'yes',
        'conditions' => $conditions
      ];

      if ($tag!=null) {

          $tagIDsQuery = 'SELECT ContextID FROM `tag_items` WHERE (`ContextClass` = "%s") AND (`TagID` = %u)';
          $tagIDsConditions = [
              'ContextClass' => DB::escape(BlogPost::getStaticRootClass()),
              'TagID' => $tag->ID
          ];

          $options = array_merge_recursive($options, [
              'conditions' => [
                  'ID' => [
                      'operator' => 'IN',
                      'values' => \DB::allValues('ContextID', $tagIDsQuery, $tagIDsConditions)
                  ]
              ]
          ]);
      }

      return BlogPost::getAllPublishedByContextObject($this, $options);
    }

    public function findLatestTeacherPost()
    {
      $sectionTeacherIds = array_map(function($Teacher) {
          return $Teacher->ID;
      }, $this->ActiveTeachers);

      $latestTeacherPost = \Emergence\CMS\BlogPost::getAllPublishedByContextObject($this, array_merge_recursive([
          'conditions' => [
              'AuthorID' => [
                  'operator' => 'IN',
                  'values' => $sectionTeacherIds
              ]
          ],
          'limit' => 1
      ]));

      return $latestTeacherPost[0];
    }

    // search SQL generators
    protected static function getTeacherSearchSql($term, $condition)
    {
        $Teacher = User::getByUsername($term);

        if (!$Teacher) {
            return 'FALSE';
        }

        try {
            $sectionIds = DB::allValues(
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

        $courseIds = DB::allValues(
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
        $Term = Term::getByHandle($term);

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
        $Location = Location::getByHandle($term);

        return $Location ? "LocationID = $Location->ID" : 'FALSE';
    }
}