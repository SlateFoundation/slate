<?php

namespace Slate;

use OutOfBoundsException;

use Emergence\People\GuardianRelationship;
use Emergence\Locations\LocationsRequestHandler;

use Slate\Courses\CoursesRequestHandler;
use Slate\Courses\SectionsRequestHandler;
use Slate\Courses\SchedulesRequestHandler;
use Slate\People\Student;
use Slate\People\PeopleRequestHandler;

abstract class RecordsRequestHandler extends \RecordsRequestHandler
{
    /**
     * Examine the current request, determine if an individual
     * student has been explicitly requested, and reject the request
     * if the current user is not authorized to load data for the
     * student
     */
    public static function getRequestedStudent($fieldName = 'student')
    {
        global $Session;

        // return null if no student was explicitly requested, let caller
        // decide what to do with that
        if (empty($_REQUEST[$fieldName])) {
            return null;
        }

        // unauthenticated users can't request anything
        $Session->requireAuthentication();

        // handle the magic value `*current`
        if ($_REQUEST[$fieldName] == '*current') {
            return $Session->Person;
        }

        // get the requested student
        $Student = PeopleRequestHandler::getRecordByHandle($_REQUEST[$fieldName]);

        if (!$Student) {
            throw new OutOfBoundsException($fieldName.' not found');
        }

        // staff and the requested student definitely have access
        $userIsStaff = $Session->hasAccountLevel('Staff');

        if ($userIsStaff || $Student->ID == $Session->PersonID) {
            return $Student;
        }

        // look up if user is a guardian for the student
        $GuardianRelationship = GuardianRelationship::getByWhere([
            'Class' => GuardianRelationship::class,
            'PersonID' => $Student->ID,
            'RelatedPersonID' => $Session->PersonID,
        ]);

        // don't differentiate between nonexistant and unauthorized
        if (!$GuardianRelationship) {
            throw new OutOfBoundsException($fieldName.' not found');
        }

        return $Student;
    }

    /**
     * Examine the current request, determine if a list
     * of students has been explicitly requested
     */
    public static function getRequestedStudents($fieldName = 'students')
    {
        global $Session;

        // return null if no students list was explicitly requested, let caller
        // decide what to do with that
        if (empty($_REQUEST[$fieldName])) {
            return null;
        }

        // try to load
        $students = Student::getAllByListIdentifier($_REQUEST[$fieldName]);
        if (!is_array($students)) {
            throw new OutOfBoundsException($fieldName.' list not found');
        }

        // filter list to self/wards if not staff
        if (!$Session->hasAccountLevel('Staff')) {
            $wardIds = GuardianRelationship::getWardIds($Session->Person);

            $students = array_filter($students, function ($Student) use ($Session, $wardIds) {
                return $Student->ID == $Session->PersonID || in_array($Student->ID, $wardIds);
            });
        }

        return $students;
    }

    /**
     * Examine the current request, determine if an individual
     * term has been explicitly requested
     */
    public static function getRequestedTerm($fieldName = 'term')
    {
        // return null if no term was explicitly requested, let caller
        // decide what to do with that
        if (empty($_REQUEST[$fieldName])) {
            return null;
        }

        // handle the magic value `*current`
        if ($_REQUEST[$fieldName] == '*current') {
            if (!$Term = Term::getClosest()) {
                throw new OutOfBoundsException('no current term found');
            }

            return $Term;
        }

        // try to load
        if (!$Term = TermsRequestHandler::getRecordByHandle($_REQUEST[$fieldName])) {
            throw new OutOfBoundsException($fieldName.' not found');
        }

        return $Term;
    }

    /**
     * Examine the current request, determine if an individual
     * course has been explicitly requested
     */
    public static function getRequestedCourse($fieldName = 'course')
    {
        // return null if no course was explicitly requested, let caller
        // decide what to do with that
        if (empty($_REQUEST[$fieldName])) {
            return null;
        }

        // try to load
        if (!$Course = CoursesRequestHandler::getRecordByHandle($_REQUEST[$fieldName])) {
            throw new OutOfBoundsException($fieldName.' not found');
        }

        return $Course;
    }

    /**
     * Examine the current request, determine if an individual
     * section has been explicitly requested, and reject the request
     * if the current user is not authorized to load data for the
     * section
     */
    public static function getRequestedSection($fieldName = 'course_section')
    {
        // return null if no section was explicitly requested, let caller
        // decide what to do with that
        if (empty($_REQUEST[$fieldName])) {
            return null;
        }

        // try to load
        if (!$Section = SectionsRequestHandler::getRecordByHandle($_REQUEST[$fieldName])) {
            throw new OutOfBoundsException($fieldName.' not found');
        }

        return $Section;
    }

    /**
     * Examine the current request, determine if an individual
     * location has been explicitly requested
     */
    public static function getRequestedLocation($fieldName = 'location')
    {
        // return null if no location was explicitly requested, let caller
        // decide what to do with that
        if (empty($_REQUEST[$fieldName])) {
            return null;
        }

        // try to load
        if (!$Location = LocationsRequestHandler::getRecordByHandle($_REQUEST[$fieldName])) {
            throw new OutOfBoundsException($fieldName.' not found');
        }

        return $Location;
    }

    /**
     * Examine the current request, determine if an individual
     * schedule has been explicitly requested
     */
    public static function getRequestedSchedule($fieldName = 'schedule')
    {
        // return null if no schedule was explicitly requested, let caller
        // decide what to do with that
        if (empty($_REQUEST[$fieldName])) {
            return null;
        }

        // try to load
        if (!$Schedule = SchedulesRequestHandler::getRecordByHandle($_REQUEST[$fieldName])) {
            throw new OutOfBoundsException($fieldName.' not found');
        }

        return $Schedule;
    }
}
