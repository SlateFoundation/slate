<?php

// TODO: bring routing style up to par with latest conventions

namespace Slate\Courses;

use Emergence\People\Person;
use Emergence\CMS\BlogPost;
use Emergence\CMS\BlogRequestHandler;
#use SpreadSheetWriter;
#use Slate\Term;
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
                return BlogRequestHandler::handleCreateRequest(BlogPost::create(array(
                    'Class' => 'Emergence\CMS\BlogPost',
                    'Context' => $Section
                )));
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
        $GLOBALS['Session']->requireAccountLevel('Staff');

        if ($personId = static::shiftPath()) {
            if (!ctype_digit($personId) || !$Participant = SectionParticipant::getByWhere(['CourseSectionID' => $Section->ID, 'PersonID' => $personId])) {
                return static::throwNotFoundError();
            }

            return static::handleParticipantRequest($Section, $Participant);
        }

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $Participant = SectionParticipant::create($_POST);

            if (!$Participant->validate()) {
                return static::throwError(reset($Participant->validationErrors));
            }

            try {
                $Participant->save();
            } catch (\DuplicateKeyException $e) {
                return static::throwError('Person is already a participant in this section.');
            }

            return static::respond('participantAdded', array(
                'success' => true,
                'data' => $Participant
            ));
        }

        return static::respond('sectionParticipants', array(
            'success' => true
            ,'data' => $Section->Participants
        ));
    }

    public static function handleParticipantRequest(Section $Section, SectionParticipant $Participant)
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');

        if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
            $Participant->destroy();

            return static::respond('participantDeleted', array(
                'success' => true,
                'data' => $Participant
            ));
        }

        return static::respond('participant', array(
            'data' => $Participant
        ));
    }

    public static function handleStudentsRequest(Section $Section)
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');

        return static::respond('students', array(
            'data' => $Section->Students
        ));
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

    public static function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
    {
#        if (empty($_REQUEST['AllCourses']) && $GLOBALS['Session']->PersonID) {
#            $conditions[] = 'ID IN (SELECT CourseSectionID FROM course_section_participants WHERE PersonID = '.$GLOBALS['Session']->PersonID.')';
#        }
#
#        if (!empty($_REQUEST['TermID'])) {
#            $term = Term::getByID($_REQUEST['TermID']);
#            $concurrentTerms = $term->getConcurrentTermIDs();
#            $containedTerms = $term->getContainedTermIDs();
#            $termIDs = array_unique(array_merge($concurrentTerms, $containedTerms));
#
#            $conditions[] = sprintf('TermID IN (%s)',join(',',$termIDs));
#        }
#
#        if (!empty($_REQUEST['start']) && !empty($_REQUEST['limit'])) {
#            $options['offset'] = $_REQUEST['start'];
#            $options['limit'] = $_REQUEST['limit'];
#        }

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