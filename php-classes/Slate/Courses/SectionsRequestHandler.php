<?php

// TODO: bring routing style up to par with latest conventions

namespace Slate\Courses;

use DB;

use Emergence\People\Person;
use Emergence\People\User;
use Emergence\CMS\BlogPost;
use Emergence\CMS\BlogRequestHandler;
#use SpreadSheetWriter;
use Slate\Term;
#use Slate\Courses\SectionParticipant;

class SectionsRequestHandler extends \RecordsRequestHandler
{
    // RecordsRequestHandler config
    public static $recordClass = 'Slate\\Courses\\Section';
    public static $accountLevelBrowse = false;
    public static $browseOrder = 'Code';

    public static function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
#            case 'addParticipants':
#                return static::handleParticipantAddRequest();
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

    public static function handleRecordRequest(\ActiveRecord $Section, $action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case 'participants':
                return static::handleParticipantsRequest($Section);
            case 'post':
                $GLOBALS['Session']->requireAuthentication();
                return BlogRequestHandler::handleCreateRequest(BlogPost::create([
                    'Class' => 'Emergence\CMS\BlogPost',
                    'Context' => $Section
                ]));
            case 'students':
                return static::handleStudentsRequest($Section);
#            case 'rss':
#                return static::getBlogsByCourseSection($Section);
            default:
                return parent::handleRecordRequest($Section, $action);
        }
    }

    public static function handleParticipantsRequest(Section $Section)
    {
        if ($personId = static::shiftPath()) {
            if (!ctype_digit($personId) || !$Participant = SectionParticipant::getByWhere(['CourseSectionID' => $Section->ID, 'PersonID' => $personId])) {
                return static::throwNotFoundError();
            }

            return static::handleParticipantRequest($Section, $Participant);
        }

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $GLOBALS['Session']->requireAccountLevel('Staff');

            $Participant = SectionParticipant::create($_POST);

            if (!$Participant->validate()) {
                return static::throwError(reset($Participant->validationErrors));
            }

            try {
                $Participant->save();
            } catch (\DuplicateKeyException $e) {
                return static::throwError('Person is already a participant in this section.');
            }

            return static::respond('participantAdded', [
                'success' => true,
                'data' => $Participant
            ]);
        }

        if (!$GLOBALS['Session']->hasAccountLevel('Staff')) {
            $userIsParticipant = false;

            foreach ($Section->Participants AS $Participant) {
                if ($Participant->PersonID == $GLOBALS['Session']->PersonID) {
                    $userIsParticipant = true;
                    break;
                }
            }

            if (!$userIsParticipant) {
                return static::throwUnauthorizedError();
            }
        }

        return static::respond('sectionParticipants', [
            'success' => true
            ,'data' => $Section->Participants
        ]);
    }

    public static function handleParticipantRequest(Section $Section, SectionParticipant $Participant)
    {
        if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
            $GLOBALS['Session']->requireAccountLevel('Staff');

            $Participant->destroy();

            return static::respond('participantDeleted', [
                'success' => true,
                'data' => $Participant
            ]);
        }

        if (!$GLOBALS['Session']->hasAccountLevel('Staff') && $GLOBALS['Session']->PersonID != $Participant->PersonID) {
            return static::throwUnauthorizedError();
        }

        return static::respond('participant', [
            'data' => $Participant
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

        return static::respond('students', [
            'data' => $Section->Students
        ]);
    }

#    public static function getBlogsByCourseSection(Section $Section)
#    {
#        static::$responseMode = 'xml';
#
#        $blogs = BlogPost::getAllByWhere(array(
#            'ContextClass' => 'Slate\\Courses\\Section'
#            ,'ContextID' => $Section->ID
#        ));
#
#        return static::respond('rss',array(
#            'success' => true
#            ,'data' => $blogs
#            ,'Title' => 'SLA Class ' . $Section->Title . ' Blog Posts'
#            ,'Link' => 'http://'.$_SERVER['HTTP_HOST'].'/sections/' . $Section->Handle
#        ));
#    }

    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        if (!empty($_REQUEST['term'])) {
            if ($_REQUEST['term'] == 'current') {
                if (!$Term = Term::getClosest()) {
                    return static::throwInvalidRequestError('No current term could be found');
                }
            } elseif (!$Term = Term::getByHandle($_REQUEST['term'])) {
                return static::throwNotFoundError('term not found');
            }

            $conditions[] = sprintf('TermID IN (%s)', join(',', $Term->getRelatedTermIDs()));
        }

        if (!empty($_REQUEST['enrolled_user'])) {
            if ($_REQUEST['enrolled_user'] == 'current') {
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

#    public static function handleParticipantRemovalRequest($Section)
#    {
#        if ($_SERVER['REQUEST_METHOD'] == 'POST' && $_POST['PersonID']) {
#            $Participant = SectionParticipant::getByWhere(array(
#                'CourseSectionID' => $Section->ID
#                ,'PersonID' => $_POST['PersonID']
#            ));
#
#            $Participant->destroy();
#
#            return static::respond('sections', array(
#                'data' => $Participant
#                ,'success' => true
#            ));
#        }
#    }
#
#    public static function handleParticipantAddRequest()
#    {
#        $courses = array();
#        if ($_SERVER['REQUEST_METHOD'] == 'POST' && $_POST['PersonID'] && $_POST['SectionIDs']) {
#            $courses = Section::assignCourses($_POST['PersonID'], $_POST['SectionIDs'], $_POST['Role']);
#
#            return static::respond('sections', array(
#                'data' => $courses
#                ,'success' => true
#            ));
#        }
#    }
}
