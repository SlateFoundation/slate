<?php

namespace Slate\Progress\Narratives;

use Slate\Term;
use Slate\Courses\Section;
use Emergence\People\Person;

class ReportsRequestHandler extends \RecordsRequestHandler
{
    // RecordsRequestHandler configuration
    public static $recordClass = Report::class;
    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelRead = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelAPI = 'Staff';


    public static function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case 'authors':
                return static::handleAuthorsRequest();
            case 'mystudents':
                return static::handleMyStudentsRequest();
            case 'all':
                return static::handleAllNarrativesRequest();
            case 'print':
                return static::handlePrintRequest();
            default:
                return parent::handleRecordsRequest($action);
        }
    }

#   static public function handleBrowseRequest()
#   {
#       return static::respond('narrativesConsole');
#   }

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

        if (!empty($_REQUEST['course_section'])) {
            if (!$Section = Section::getByHandle($_REQUEST['course_section'])) {
                return static::throwNotFoundError('course_section not found');
            }

            $conditions['CourseSectionID'] = $Section->ID;
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }

#   static protected function onBeforeRecordSaved($Narrative, $datum)
#   {
#
#   }

    public static function handleMyStudentsRequest()
    {
        global $Session;

        $Session->requireAccountLevel('Staff');

        if (empty($_REQUEST['termID']) || !is_numeric($_REQUEST['termID'])) {
            $Term = Term::getCurrent();
        } elseif (!$Term = Term::getByID($_REQUEST['termID'])) {
            return static::throwNotFoundError('Term not found');
        }
        //TODO: refactor to inculde tableNames and Class in condition array
        $reportQuery = 'SELECT'
            .' Existing.ID AS ID'
            .' ,"'.\DB::escape(Report::class).'" AS Class'
            .' ,IFNULL(Existing.Created,CURRENT_TIMESTAMP) AS Created'
            .' ,IFNULL(Existing.CreatorID,%1$u) AS CreatorID'
            .' ,StudentPart.PersonID AS StudentID'
            .' ,StudentPart.CourseSectionID AS CourseSectionID'
            .' ,%2$u AS TermID'
            .' ,IFNULL(Existing.Status,"Phantom") AS Status'
            .' ,Existing.Grade AS Grade'
            .' ,Existing.Assessment AS Assessment'
            .' ,Existing.Comments AS Comments'
            .' FROM course_section_participants StudentPart'
            .' LEFT JOIN people Student ON (Student.ID = StudentPart.PersonID)'
            .' LEFT JOIN narrative_reports Existing ON (Existing.StudentID = StudentPart.PersonID AND Existing.CourseSectionID = StudentPart.CourseSectionID AND TermID = %2$u)'
            .' WHERE StudentPart.CourseSectionID IN';

        if (!empty($_REQUEST['courseSectionID'])) {
            $reportQuery .= '('.$_REQUEST['courseSectionID'].')';
        } else {
            $reportQuery .= '('
                .'     SELECT CourseSectionID'
                .'     FROM course_section_participants InstructorPart'
                .'     LEFT JOIN course_sections InstructorSection ON (InstructorSection.ID = InstructorPart.CourseSectionID)'
                .'     WHERE InstructorPart.PersonID = %1$u AND InstructorPart.Role = "Instructor" AND InstructorSection.TermID IN (%3$s)'
                .'   )';
        }

        $reportQuery .= '   AND StudentPart.Role = "Student"';

        return static::respond('narrativeReports', [
            'success' => true
            ,'term' => $Term
            ,'data' => Report::getAllByQuery(
                $reportQuery,
                [
                    $Session->PersonID,
                    $Term->ID,
                    join(',', $Term->getConcurrentTermIDs())
                ]
            )
        ]);
    }

    public static function handleAuthorsRequest()
    {
        global $Session;

        $Session->requireAccountLevel('Staff');

        return static::respond('narrativeAuthors', [
            'success' => true
            ,'data' => Person::getAllByQuery(
                'SELECT Person.* FROM (SELECT DISTINCT CreatorID FROM `%s`) AS Author LEFT JOIN `%s` Person ON (Person.ID = Author.CreatorID) ORDER BY Person.LastName, Person.FirstName',
                [
                    Report::$tableName,
                    Person::$tableName
                ]
            )
        ]);
    }

    public static function handleAllNarrativesRequest()
    {
        global $Session;

        $Session->requireAccountLevel('Staff');

        if (empty($_REQUEST['termID']) || !is_numeric($_REQUEST['termID'])) {
            $Term = Term::getCurrent();
        } elseif (!$Term = Term::getByID($_REQUEST['termID'])) {
            return static::throwNotFoundError('Term not found');
        }

        return static::respond('narrativeReports', [
            'success' => true,
            'term' => $Term,
            'data' => Report::getAllByWhere([
                'TermID' => $Term->ID
            ])
        ]);
    }

    public static function handlePrintRequest()
    {
        global $Session;

        $Session->requireAccountLevel('Staff');

        if (empty($_REQUEST['termID']) || !is_numeric($_REQUEST['termID'])) {
            $Term = Term::getCurrent();
        } elseif (!$Term = Term::getByID($_REQUEST['termID'])) {
            return static::throwNotFoundError('Term not found');
        }

        $filename = 'Narrative Reports';
        $where = [
            'TermID' => $Term->ID
        ];

        if (!empty($_REQUEST['sectionID']) && is_numeric($_REQUEST['sectionID'])) {
            $where['CourseSectionID'] = $_REQUEST['sectionID'];
        }

        if (!empty($_REQUEST['advisorID']) && is_numeric($_REQUEST['advisorID']) && ($Advisor = Person::getByID($_REQUEST['advisorID']))) {
            $where[] = 'StudentID IN (SELECT Student.ID FROM people Student WHERE Student.AdvisorID = '.$_REQUEST['advisorID'].')';
            $filename .= ' - '.$Advisor->LastName;
        }

        if (!empty($_REQUEST['authorID']) && is_numeric($_REQUEST['authorID']) && ($Author = Person::getByID($_REQUEST['authorID']))) {
            $where[] = 'CreatorID = '.$_REQUEST['authorID'];
            $filename .= ' - by '.$Author->Username;
        }

        if (!empty($_REQUEST['studentID']) && is_numeric($_REQUEST['studentID']) && ($Student = Person::getByID($_REQUEST['studentID']))) {
            $where['StudentID'] = $_REQUEST['studentID'];
            $filename .= ' - '.$Student->Username;
        }

        $html = \TemplateResponse::getSource('print', [
            'Term' => $Term
            ,'data' => Report::getAllByWhere($where, [
                'order' => '(SELECT CONCAT(LastName,FirstName) FROM people WHERE people.ID = StudentID)'
                ,'limit' => (!empty($_REQUEST['limit']) && is_numeric($_REQUEST['limit'])) ? $_REQUEST['limit'] : false
            ])
        ]);

        if (static::peekPath() == 'preview') {
            die($html);
        }

        $filename .= ' ('.date('Y-m-d').')';
        $filePath = tempnam('/tmp', 'slate_nr_');

        file_put_contents($filePath.'.html', $html);
        $command = "xvfb-run --server-args=\"-screen 0, 1024x768x24\" wkhtmltopdf \"$filePath.html\" \"$filePath.pdf\"";


        if (static::peekPath() == 'stage') {
            die($command);
        } else {
            exec($command);

            header('Content-Type: application/pdf');
            header("Content-Disposition: attachment; filename=\"$filename.pdf\"");
            readfile($filePath.'.pdf');
            exit();
        }
    }
}