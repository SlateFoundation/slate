<?php

namespace Slate\Courses;

use DB;
use ActiveRecord;
use DuplicateKeyException;
use Tag;

use Emergence\People\Person;
use Emergence\People\User;
use Emergence\CMS\BlogPost;
use Emergence\CMS\BlogRequestHandler;
use Emergence\Locations\LocationsRequestHandler;

use Slate\Term;
use Slate\TermsRequestHandler;
use Slate\People\Student;


class SectionsRequestHandler extends \Slate\RecordsRequestHandler
{
    public static $recordClass = Section::class;
    public static $accountLevelBrowse = false;
    public static $browseOrder = ['Code' => 'ASC'];


    public static function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case '*teachers':
                return static::respond('teachers', [
                    'data' => Person::getAllByQuery(
                        'SELECT Teacher.* FROM (SELECT PersonID FROM `%s` WHERE Role = "Teacher") Participant JOIN `%s` Teacher ON Teacher.ID = Participant.PersonID'
                        ,[
                            SectionParticipant::$tableName
                            ,Person::$tableName
                        ]
                    )
                ]);
            default:
                return parent::handleRecordsRequest($action);
        }
    }

    protected static function buildBrowseConditions(array $conditions = [], array &$filterObjects = [])
    {
        $conditions = parent::buildBrowseConditions($conditions, $filterObjects);

        if ($Term = static::getRequestedTerm()) {
            $conditions['TermID'] = [ 'values' => $Term->getRelatedTermIDs() ];
            $filterObjects['Term'] = $Term;
        }

        if ($Course = static::getRequestedCourse()) {
            $conditions['CourseID'] = $Course->ID;
            $filterObjects['Course'] = $Course;
        }

        if ($Location = static::getRequestedLocation()) {
            $conditions['LocationID'] = $Location->ID;
            $filterObjects['Location'] = $Location;
        }

        if ($Schedule = static::getRequestedSchedule()) {
            $conditions['ScheduleID'] = $Schedule->ID;
            $filterObjects['Schedule'] = $Schedule;
        }

        if ($Department = static::getRequestedDepartment()) {
            $courseIds = DB::allValues(
                'ID',
                'SELECT ID FROM `%s` WHERE DepartmentID = %u',
                [
                    Course::$tableName,
                    $Department->ID
                ]
            );

            $conditions[] = sprintf('CourseID IN (%s)', count($courseIds) ? join(',', $courseIds) : '0');
            $filterObjects['Department'] = $Department;
        }

        if ($EnrolledUser = static::getRequestedStudent('enrolled_user')) {
            $enrolledSectionIds = DB::allValues(
                'CourseSectionID',
                'SELECT CourseSectionID FROM `%s` WHERE PersonID = %u',
                [
                    SectionParticipant::$tableName,
                    $EnrolledUser->ID
                ]
            );

            $conditions[] = sprintf('ID IN (%s)', count($enrolledSectionIds) ? join(',', $enrolledSectionIds) : '0');
            $filterObjects['EnrolledUser'] = $EnrolledUser;
        }

        return $conditions;
    }

    public static function handleRecordRequest(ActiveRecord $Section, $action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case 'cohorts':
                return static::handleCohortsRequest($Section);
            case 'post':
                $GLOBALS['Session']->requireAuthentication();
                return BlogRequestHandler::handleCreateRequest(BlogPost::create([
                    'Class' => BlogPost::class,
                    'Context' => $Section
                ]));
            case 'students':
                return static::handleStudentsRequest($Section);
            case '':
            case false:
                return static::handleSectionRequest($Section, $action);
            default:
                return parent::handleRecordRequest($Section, $action);
        }
    }

    public static function handleSectionRequest(Section $Section, $action)
    {
      $className = static::$recordClass;

      $limit = isset($_REQUEST['limit']) && ctype_digit($_REQUEST['limit']) ? (integer)$_REQUEST['limit'] : 10;
      $offset = isset($_REQUEST['offset']) && ctype_digit($_REQUEST['offset']) ? (integer)$_REQUEST['offset'] : 0;
      $handle = $_REQUEST['blog-tag'];

      $conditions = [];
      $latestTeacherPost = false;
      $tag = null;

      if ($handle) {
          $tag = Tag::getByHandle($handle);

          if (!$tag) {
              return static::throwNotFoundError('tag not found');
          }
      } else {
          $latestTeacherPost = $Section->findLatestTeacherPost();

          if ($latestTeacherPost) {
              $conditions[] = sprintf('ID != %u', $latestTeacherPost->ID);
          }
      }

      return static::respond(static::getTemplateName($className::$singularNoun), array(
          'success' => true
          ,'data' => $Section
          ,'tags' => $Section->findBlogTags()
          ,'blogTag' => $tag
          ,'latestTeacherPost' => $latestTeacherPost
          ,'blogPosts' => $Section->findBlogPosts($conditions, $limit ?: 4, $offset, $tag )
          ,'total' => DB::foundRows()
          ,'limit' => $limit
          ,'offset' => $offset
      ));
    }

    public static function handleCohortsRequest(Section $Section)
    {
        return static::respond('sectionCohorts', [
            'success' => true,
            'data' => $Section->getCohorts()
        ]);
    }

    public static function handleStudentsRequest(Section $Section)
    {
        if (!$GLOBALS['Session']->hasAccountLevel('Staff')) {
            $userIsStudent = false;

            foreach ($Section->Students AS $Student) {
                if ($Student->ID == $GLOBALS['Session']->PersonID) {
                    $userIsStudent = true;
                    break;
                }
            }

            if (!$userIsStudent) {
                return static::throwUnauthorizedError();
            }
        }

        // conditionally filter students by cohort
        if (!empty($_REQUEST['cohort'])) {
            try {
                $students = Person::getAllByQuery('
                    SELECT Person.* FROM `%1$s` Person
                    JOIN `%2$s` SectionParticipant ON Person.ID = SectionParticipant.PersonID
                    WHERE SectionParticipant.CourseSectionID = %3$u
                    AND SectionParticipant.Cohort = "%4$s"
                ', [
                    Person::$tableName, // 1
                    SectionParticipant::$tableName, // 2
                    $Section->ID, // 3
                    DB::escape($_REQUEST['cohort']) // 4
                ]);
            } catch (\TableNotFoundException $e) {
                $students = [];
            }
        } elseif (!empty($_REQUEST['inactive'])) {
            $students = $Section->Students;
        } else {
            $students = $Section->ActiveStudents;
        }

        return static::respond('students', [
            'data' => $students
        ]);
    }
}
