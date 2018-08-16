<?php

namespace Slate;


use Emergence\People\GuardianRelationship;

use Slate\Courses\SectionsRequestHandler;
use Slate\People\PeopleRequestHandler;

abstract class RecordsRequestHandler extends \RecordsRequestHandler
{
    /**
     * Examine the current request, determine if an individual
     * student has been explicitly requested, and reject the request
     * if the current user is not authorized to load data for the
     * student
     */
    protected static function getRequestedStudent()
    {
        global $Session;

        // return null if no student was explicitely requested, let caller
        // decide what to do with that
        if (empty($_REQUEST['student'])) {
            return null;
        }

        // unauthenticated users can't request anything
        $Session->requireAuthentication();

        // handle the magic value `*current`
        if ($_REQUEST['student'] == '*current') {
            return $Session->Person;
        }

        // get the requested student
        $Student = PeopleRequestHandler::getRecordByHandle($_REQUEST['student']);
        $userIsStaff = $Session->hasAccountLevel('Staff');

        // staff and the requested student definitely have access
        if ($userIsStaff || $Student->ID == $Session->PersonID) {
            return $Student;
        }

        // look up if they are a guardian
        if ($Student) {
            $GuardianRelationship = GuardianRelationship::getByWhere([
                'PersonID' => $Student->ID,
                'RelatedPersonID' => $Session
            ]);
        }

        // don't differentiate between nonexistant and unauthorized
        if (!$Student || !$GuardianRelationship) {
            return static::throwNotFoundError('Student not found');
        }

        return $Student;
    }

    /**
     * Examine the current request, determine if an individual
     * section has been explicitly requested, and reject the request
     * if the current user is not authorized to load data for the
     * section
     */
    protected static function getRequestedSection()
    {
        // return null if no section was explicitely requested, let caller
        // decide what to do with that
        if (empty($_REQUEST['course_section'])) {
            return null;
        }

        // try to load
        if (!$Section = SectionsRequestHandler::getRecordByHandle($_REQUEST['course_section'])) {
            return static::throwNotFoundError('Course section not found');
        }

        return $Section;
    }
}