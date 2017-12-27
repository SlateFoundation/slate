<?php

namespace Slate\Courses;

use DB;
use ActiveRecord;
use DuplicateKeyException;

use Emergence\People\Person;
use Emergence\People\User;
use Emergence\CMS\BlogPost;
use Emergence\CMS\BlogRequestHandler;
use Emergence\Locations\LocationsRequestHandler;

use Slate\Term;
use Slate\TermsRequestHandler;
use Slate\People\Student;


class SectionsRequestHandler extends \RecordsRequestHandler
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

    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        if (empty($_REQUEST['term']) || $_REQUEST['term'] == '*current') {
            if (!$Term = Term::getClosest()) {
                return static::throwInvalidRequestError('No current term could be found');
            }
        } elseif ($_REQUEST['term'] != '*') {
            if (!$Term = TermsRequestHandler::getRecordByHandle($_REQUEST['term'])) {
                return static::throwNotFoundError('term not found');
            }
        }

        if ($Term) {
            $conditions[] = sprintf('TermID IN (%s)', join(',', $Term->getRelatedTermIDs()));
            $responseData['Term'] = $Term;
        }

        if (!empty($_REQUEST['course'])) {
            if (!$Course = CoursesRequestHandler::getRecordByHandle($_REQUEST['course'])) {
                return static::throwNotFoundError('course not found');
            }

            $conditions['CourseID'] = $Course->ID;
            $responseData['Course'] = $Course;
        }

        if (!empty($_REQUEST['location'])) {
            if (!$Location = LocationsRequestHandler::getRecordByHandle($_REQUEST['location'])) {
                return static::throwNotFoundError('location not found');
            }

            $conditions['LocationID'] = $Location->ID;
            $responseData['Location'] = $Location;
        }

        if (!empty($_REQUEST['schedule'])) {
            if (!$Schedule = SchedulesRequestHandler::getRecordByHandle($_REQUEST['schedule'])) {
                return static::throwNotFoundError('schedule not found');
            }

            $conditions['ScheduleID'] = $Schedule->ID;
            $responseData['Schedule'] = $Schedule;
        }

        if (!empty($_REQUEST['enrolled_user'])) {
            if ($_REQUEST['enrolled_user'] == '*current') {
                $GLOBALS['Session']->requireAuthentication();
                $EnrolledUser = $GLOBALS['Session']->Person;
            } elseif (!$EnrolledUser = User::getByHandle($_REQUEST['enrolled_user'])) {
                return static::throwNotFoundError('enrolled_user not found');
            }

            $enrolledSectionIds = DB::allValues(
                'CourseSectionID',
                'SELECT CourseSectionID FROM `%s` WHERE PersonID = %u',
                [
                    SectionParticipant::$tableName,
                    $EnrolledUser->ID
                ]
            );

            $conditions[] = sprintf('ID IN (%s)', count($enrolledSectionIds) ? join(',', $enrolledSectionIds) : '0');
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
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
            default:
                return parent::handleRecordRequest($Section, $action);
        }
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
        } else {
            $students = $Section->Students;
        }

        return static::respond('students', [
            'data' => $students
        ]);
    }
}
