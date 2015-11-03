<?php

namespace Slate\Progress\Narratives;

use Slate\Term;
use Slate\Standards\PromptGrade;
use Slate\Courses\Section;

use Emergence\People\Person;

class NarrativesRequestHandler extends \RequestHandler
{
    public static function handleRequest()
    {
        if ($_SERVER['HTTP_ACCEPT'] == 'application/json') {
            static::$responseMode = 'json';
        }

        switch ($action = static::shiftPath()) {
            case 'authors':
                return static::handleAuthorsRequest();
            case 'print':
                return static::handlePrintRequest();
            case 'email':
                return static::handleEmailRequest();
#            case 'worksheets':
#                \ScienceLeadership\SBG\Standards\WorksheetsRequestHandler::$responseMode = static::$responseMode;
#                return \Slate\Standards\WorksheetsRequestHandler::handleRequest();
#            case 'assignments':
#                WorksheetAssignmentsRequestHandler::$responseMode = static::$responseMode;
#                return WorksheetAssignmentsRequestHandler::handleRequest();
            case 'my-sections':
                return static::handleMySectionsRequest();
            case 'term-sections':
                return static::handleTermSectionsRequest();
            case 'section-students':
                return static::handleSectionStudentsRequest();
            case 'student-worksheet':
                return static::handleStudentWorksheetRequest();
            case 'worksheet-save':
                return static::handleWorksheetSaveRequest();
            default:
                return static::throwInvalidRequestError();
        }
    }

    public static function handleMySectionsRequest()
    {
        global $Session;

        $Session->requireAccountLevel('Staff');

        if (empty($_REQUEST['termID']) || !is_numeric($_REQUEST['termID'])) {
            $Term = Term::getCurrent();
        } elseif (!$Term = Term::getByID($_REQUEST['termID'])) {
            return static::throwNotFoundError('Term not found');
        }


        return static::respond('standardsSections', [
            'success' => true
            ,'data' => WorksheetAssignment::getAllByQuery(
                'SELECT'
                .' Existing.ID AS ID'
                .' ,"NarrativesWorksheetAssignment" AS Class'
                .' ,IFNULL(Existing.Created,CURRENT_TIMESTAMP) AS Created'
                .' ,IFNULL(Existing.CreatorID,%1$u) AS CreatorID'
                .' ,IFNULL(Existing.TermID, %2$u) AS TermID'
                .' ,InstructorPart.CourseSectionID AS CourseSectionID'
                .' ,Existing.WorksheetID'
                .' ,Existing.Description'
                .' FROM course_section_participants InstructorPart'
                .' LEFT JOIN narratives_worksheet_assignments Existing ON (Existing.TermID = %2$u AND Existing.CourseSectionID = InstructorPart.CourseSectionID)'
                .' LEFT JOIN course_sections Section ON  (Section.ID = InstructorPart.CourseSectionID)'
                .' WHERE InstructorPart.PersonID = %1$u AND InstructorPart.Role = "Instructor" AND Section.TermID IN (%3$s)',
                [
                    $Session->PersonID,
                    $Term->ID,
                    implode(',', $Term->getConcurrentTermIDs())
                ]
            )
        ]);
    }

    public static function handleWorksheetSaveRequest()
    {
        $GLOBALS['Session']->requireAuthentication();

        $saved = [];
        $failed = [];


        if (!$_REQUEST['narrativeID']) {
            $Narrative = Report::getByID($_REQUEST['narrativeID']);
            if (!$Narrative) {
                return static::throwNotFoundError('Supplied invalid narrative to edit');
            }
        } elseif (!$Narrative) {
            $Narrative = new Report();

            $Narrative->StudentID = $_REQUEST['studentID'];
            $Narrative->CourseSectionID = $_REQUEST['courseSectionID'];
            $Narrative->TermID = $_REQUEST['termID'];
        }

        $Narrative->Status = $_REQUEST['Status'];
        $Narrative->Grade = $_REQUEST['Grade'];
        $Narrative->Assessment = $_REQUEST['Assessment'];
        $Narrative->Comments = $_REQUEST['Comments'];

        if ($Narrative->isValid) {
            $Narrative->save();
        } else {
            return static::throwError('Narrative invalid.');
        }


        foreach ($_POST AS $key => $value) {
            if (!preg_match('/^prompt-(\d+)$/i', $key, $matches)) {
                continue;
            }

            $gradeData = [
                'TermID' => $_REQUEST['termID'],
                'CourseSectionID' => $_REQUEST['courseSectionID'],
                'StudentID' => $_REQUEST['studentID'],
                'PromptID' => $matches[1]
            ];

            // get existing grade or create
            if (!$Grade = PromptGrade::getByWhere($gradeData)) {
                $Grade = PromptGrade::create($gradeData);
            }

            $Grade->Grade = $value;

            if ($Grade->validate()) {
                $Grade->save();
                $saved[] = $Grade->getDetails(['Prompt']);
            } else {
                $failed[] = $Grade;
            }
        }

        return static::respond('narrativeSaved', [
            'success' => true,
            'data' => $Narrative,
            'standards' => $saved,
            'failedStandards' => $failed
        ]);
    }

    public static function handleTermSectionsRequest()
    {
        global $Session;

        $Session->requireAccountLevel('Staff');

        if (empty($_REQUEST['termID']) || !is_numeric($_REQUEST['termID'])) {
            $Term = Term::getCurrent();
        } elseif (!$Term = Term::getByID($_REQUEST['termID'])) {
            return static::throwNotFoundError('Term not found');
        }


        return static::respond('standardsSections', [
            'success' => true,
            'data' => WorksheetAssignment::getAllByQuery(
                'SELECT'
                .' Existing.ID AS ID'
                .' ,"NarrativesWorksheetAssignment" AS Class'
                .' ,IFNULL(Existing.Created,CURRENT_TIMESTAMP) AS Created'
                .' ,IFNULL(Existing.CreatorID,%1$u) AS CreatorID'
                .' ,IFNULL(Existing.TermID, %2$u) AS TermID'
                .' ,Section.ID AS CourseSectionID'
                .' ,Existing.WorksheetID'
                .' ,Existing.Description'
                .' FROM course_sections Section'
                .' LEFT JOIN narratives_worksheet_assignments Existing ON (Existing.TermID = %2$u AND Existing.CourseSectionID = Section.ID)'
                .' WHERE'
                .'  Section.TermID IN ('
                .'    SELECT parent.ID'
                .'    FROM course_terms AS term, course_terms AS parent'
                .'    WHERE term.Left BETWEEN parent.Left AND parent.Right AND term.ID = %2$u'
                .'    ORDER BY parent.Left'
                .'  )',
                [
                    $Session->PersonID,
                    $Term->ID
                ]
            )
        ]);
    }


    public static function handleSectionStudentsRequest()
    {
        global $Session;

        $Session->requireAccountLevel('Staff');

        if (empty($_REQUEST['termID']) || !is_numeric($_REQUEST['termID'])) {
            $Term = Term::getCurrent();
        } elseif (!$Term = Term::getByID($_REQUEST['termID'])) {
            return static::throwNotFoundError('TermID not found');
        }

        if (empty($_REQUEST['courseSectionID']) || !is_numeric($_REQUEST['courseSectionID'])) {
            return static::throwNotFoundError('CourseSectionID missing');
        } elseif (!$Section = Section::getByID($_REQUEST['courseSectionID'])) {
            return static::throwNotFoundError('CourseSection not found');
        }


        return static::respond('sectionStudents', [
            'success' => true
            ,'data' => \DB::allRecords(
                'SELECT'
                .' Student.ID, Student.FirstName, Student.LastName, COUNT(Grade.ID) AS PromptsGraded'
                .' FROM course_section_participants StudentPart'
                .' LEFT JOIN people Student ON (Student.ID = StudentPart.PersonID)'
                .' LEFT JOIN standards_prompt_grades Grade ON (Grade.TermID = %2$u AND Grade.CourseSectionID = %1$u AND Grade.StudentID = Student.ID)'
                //.' LEFT JOIN standards_worksheet_assignments Existing ON (Existing.TermID = %2$u AND Existing.CourseSectionID = InstructorPart.CourseSectionID)'
.' WHERE StudentPart.CourseSectionID = %1$u AND StudentPart.Role = "Student"'
                .' GROUP BY Student.ID'
                .' ORDER BY Student.LastName, Student.FirstName',
                [
                    $Section->ID,
                    $Term->ID
                ]
            )
        ]);
    }

    public static function handleStudentWorksheetRequest()
    {
        global $Session;

        $Session->requireAccountLevel('Staff');

        if (empty($_REQUEST['termID']) || !is_numeric($_REQUEST['termID'])) {
            $Term = Term::getCurrent();
        } elseif (!$Term = Term::getByID($_REQUEST['termID'])) {
            return static::throwNotFoundError('TermID not found');
        }

        if (empty($_REQUEST['courseSectionID']) || !is_numeric($_REQUEST['courseSectionID'])) {
            return static::throwNotFoundError('CourseSectionID missing');
        }

        if (empty($_REQUEST['studentID']) || !is_numeric($_REQUEST['studentID'])) {
            return static::throwNotFoundError('StudentID missing');
        }

        $concurrentTerms = $Term->getConcurrentTermIDs();
        $containedTerms = $Term->getContainedTermIDs();
        $termIDs = array_unique(array_merge($concurrentTerms, $containedTerms));

        $WorksheetAssignment = WorksheetAssignment::getByWhere([
            'TermID IN ('.join(',', $termIDs).')'
            ,'CourseSectionID' => $_REQUEST['courseSectionID']
        ]);

        if (!$WorksheetAssignment) {
            return static::throwError('A worksheet must be assigned to this section before students can be graded');
        }


        // handle post
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $saved = [];
            $failed = [];

            foreach ($_POST AS $key => $value) {
                if (!preg_match('/^prompt-(\d+)$/i', $key, $matches)) {
                    continue;
                }

                $gradeData = [
                    'TermID' => $Term->ID,
                    'CourseSectionID' => $WorksheetAssignment->CourseSectionID,
                    'StudentID' => $_REQUEST['studentID'],
                    'PromptID' => $matches[1]
                ];

                // get existing grade or create
                if (!$Grade = PromptGrade::getByWhere($gradeData)) {
                    $Grade = PromptGrade::create($gradeData);
                }

                $Grade->Grade = $value;

                if ($Grade->validate()) {
                    $Grade->save();
                    $saved[] = $Grade;
                } else {
                    $failed[] = $Grade;
                }
            }

            return static::respond('studentWorksheetSaved', [
                'success' => true,
                'data' => $saved,
                'failed' => $failed
            ]);
        }

        return static::respond('studentWorksheet', [
            'success' => true
            ,'data' => PromptGrade::getAllByQuery(
                'SELECT'
                .' Grade.ID AS ID'
                .' ,"StandardsPromptGrade" AS Class'
                .' ,IFNULL(Grade.Created,CURRENT_TIMESTAMP) AS Created'
                .' ,IFNULL(Grade.CreatorID,%1$u) AS CreatorID'
                .' ,%2$u AS TermID'
                .' ,%3$u AS StudentID'
                .' ,%4$u AS CourseSectionID'
                .' ,WorksheetPrompt.PromptID'
                .' ,Grade.Grade'
                .' FROM standards_worksheet_prompts WorksheetPrompt'
                .' LEFT JOIN standards_prompt_grades Grade ON (Grade.TermID = %2$u AND Grade.CourseSectionID = %4$u AND Grade.StudentID = %3$u AND Grade.PromptID = WorksheetPrompt.PromptID)'
                .' LEFT JOIN standards_prompts Prompt ON Prompt.ID = WorksheetPrompt.PromptID'
                .' WHERE WorksheetPrompt.WorksheetID = %5$u'
                .' ORDER BY Prompt.Prompt',
                [
                    $Session->PersonID,
                    $Term->ID,
                    $_REQUEST['studentID'],
                    $WorksheetAssignment->CourseSectionID,
                    $WorksheetAssignment->WorksheetID
                ]
            )
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
        $responseQuery = [];

        if (!empty($_REQUEST['advisorID']) && is_numeric($_REQUEST['advisorID']) && ($Advisor = Person::getByID($_REQUEST['advisorID']))) {
            $where[] = 'StudentID IN (SELECT Student.ID FROM people Student WHERE Student.AdvisorID = '.$_REQUEST['advisorID'].')';
            $responseQuery['AdvisorID'] = $_REQUEST['advisorID'];
            $filename .= ' - '.$Advisor->LastName;
        }

        if (!empty($_REQUEST['authorID']) && is_numeric($_REQUEST['authorID']) && ($Author = Person::getByID($_REQUEST['authorID']))) {
            $where['CreatorID'] = $_REQUEST['authorID'];
            $responseQuery['AuthorID'] = $_REQUEST['authorID'];
            $filename .= ' - by '.$Author->Username;
        }

        if (!empty($_REQUEST['studentID']) && is_numeric($_REQUEST['studentID']) && ($Student = Person::getByID($_REQUEST['studentID']))) {
            $where['StudentID'] = $_REQUEST['studentID'];
            $responseQuery['StudentID'] = $_REQUEST['studentID'];
            $filename .= ' - '.$Student->Username;
        }

        if (!empty($_REQUEST['narrativeID']) && is_numeric($_REQUEST['narrativeID'])) {
            $where = [];
            $where['ID'] = $_REQUEST['narrativeID'];

            $responseQuery['NarrativeID'] = $_REQUEST['narrativeID'];
        }

        $html = \Emergence\Dwoo\Engine::getSource('progress/narratives/print', [
            'Term' => $Term,
            'data' => Report::getAllByWhere($where, [
                'order' => '(SELECT CONCAT(LastName,FirstName) FROM people WHERE people.ID = StudentID)',
                'limit' => (!empty($_REQUEST['limit']) && is_numeric($_REQUEST['limit'])) ? $_REQUEST['limit'] : false
            ]),
            'query' => $responseQuery
        ]);

        if (static::peekPath() == 'preview') {
            die($html);
        }

        $filename .= ' ('.date('Y-m-d').')';
        $filePath = tempnam('/tmp', 'slate_nr_');

        file_put_contents($filePath.'.html', $html);
        $command = "xvfb-run --server-args=\"-screen 0, 1024x768x24\" wkhtmltopdf -O Landscape \"$filePath.html\" \"$filePath.pdf\"";


        if (static::peekPath() == 'stage') {
            die($command);
        } else {
            exec($command);

            if (!empty($_REQUEST['downloadToken'])) {
                setcookie('downloadToken', $_REQUEST['downloadToken'], time()+300, '/');
            }

            header('Content-Type: application/pdf');
            header("Content-Disposition: attachment; filename=\"$filename.pdf\"");
            readfile($filePath.'.pdf');
            exit();
        }
    }


    public static function handleEmailRequest()
    {
        global $Session;

        $Session->requireAccountLevel('Staff');

        set_time_limit(0);
        printf('Beggining job with %s memory available<hr>', ini_get('memory_limit'));

        if (empty($_REQUEST['termID']) || !is_numeric($_REQUEST['termID'])) {
            $Term = Term::getCurrent();
        } elseif (!$Term = Term::getByID($_REQUEST['termID'])) {
            return static::throwNotFoundError('Term not found');
        }

        $where = [
            'TermID' => $Term->ID,
            'EXISTS(SELECT swp.ID FROM standards_worksheet_prompts swp WHERE swp.PromptID = StandardsPromptGrade.PromptID AND swp.WorksheetID = (SELECT swa.WorksheetID FROM standards_worksheet_assignments swa WHERE swa.TermID = StandardsPromptGrade.TermID AND swa.CourseSectionID = StandardsPromptGrade.CourseSectionID))'
        ];

        if (!empty($_REQUEST['sectionID']) && is_numeric($_REQUEST['sectionID'])) {
            $where['CourseSectionID'] = $_REQUEST['sectionID'];
        }

        if (!empty($_REQUEST['advisorID']) && is_numeric($_REQUEST['advisorID']) && ($Advisor = Person::getByID($_REQUEST['advisorID']))) {
            $where[] = 'StudentID IN (SELECT Student.ID FROM people Student WHERE Student.AdvisorID = '.$_REQUEST['advisorID'].')';
        }

        if (!empty($_REQUEST['studentID']) && is_numeric($_REQUEST['studentID']) && ($Student = Person::getByID($_REQUEST['studentID']))) {
            $where['StudentID'] = $_REQUEST['studentID'];
        }


        $grades = PromptGrade::getAllByWhere($where, [
            'order' =>
                '(SELECT CONCAT(LastName,FirstName,people.ID) FROM people WHERE people.ID = StudentID)'
                .', CourseSectionID'
                .', (SELECT Prompt FROM standards_prompts WHERE standards_prompts.ID = PromptID)',
            'limit' => (!empty($_REQUEST['limit']) && is_numeric($_REQUEST['limit'])) ? $_REQUEST['limit'] : false
        ]);

        $gradesBuffer = [];
        $lastGrade = false;
        foreach ($grades AS $grade) {
            if ($lastGrade && ($grade->StudentID != $lastGrade->StudentID)) {
                // dump student grades buffer and empty buffer
                static::emailReport($Term, $lastGrade->Student, $gradesBuffer);
                $gradesBuffer = [];
            }

            $gradesBuffer[] = $lastGrade = $grade;
        }

        // dump last student
        if (count($gradesBuffer)) {
            print("<hr>sending last:<br>");
            static::emailReport($Term, $lastGrade->Student, $gradesBuffer);
        }

        die("<h1>done</h1>");
    }

    protected static $_emailsSent = 0;
    protected static $_emailTemplate;
    protected static function emailReport(CourseTerm $Term, Person $Student, $grades)
    {
        if (!static::$_emailTemplate) {
            static::$_emailTemplate = \TemplateResponse::getInstance()->templateFactory('Emergence', 'email.tpl');
        }

        printf('%u - Generating report for student #%u of %u with %u grades...', static::$_emailsSent, $Student->ID, $Student->GraduationYear, count($grades));

        $subject = 'Your Standards-Based Report Card for '.$Term->Title;

        $html = \TemplateResponse::getSource(static::$_emailTemplate, [
            'Term' => $Term,
            'Student' => $Student,
            'data' => $grades
        ]);

        printf("Emailing %u bytes to %s<br>", strlen($html), htmlspecialchars($Student->EmailRecipient));
        flush();




        //Email::send('calfano@scienceleadership.org', $subject, $html);
        $success = \Email::send($Student->EmailRecipient, $subject, $html);
        $html = null;
        static::$_emailsSent++;
        return $success;

        //if(static::$_emailsSent >= 5) die('canceling');
    }

    public static function handleAuthorsRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');

        return static::respond('narrativeAuthors', [
            'success' => true,
            'data' => Person::getAllByQuery(
                'SELECT Person.* FROM (SELECT DISTINCT CreatorID FROM `%s`) AS Author LEFT JOIN `%s` Person ON (Person.ID = Author.CreatorID) ORDER BY Person.LastName, Person.FirstName',
                [
                    Report::$tableName,
                    Person::$tableName
                ]
            )
        ]);
    }
}