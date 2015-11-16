<?php

namespace Slate\SBG;

use Site, TemplateResponse, DB;
use Emergence\Mailer\Mailer;
use Emergence\People\Person;
use Slate\Term;
use Slate\Courses\Section;

// TODO: use sendFromTemplate instead of TemplateResponse
// TODO: eliminate this file in favor of separate site-root/standards/* files for each subroute

class StandardsRequestHandler extends \RequestHandler
{
    public static $responseMode = 'json';

    public static function handleRequest()
    {
        if (Site::$pathStack[0] == 'json') {
            static::$responseMode = array_shift(Site::$pathStack);
        }

        switch ($action = array_shift(Site::$pathStack)) {
            case 'print':
                return static::handlePrintRequest();

            case 'email':
                return static::handleEmailRequest();

            case 'worksheets':
                WorksheetsRequestHandler::$responseMode = static::$responseMode;
                return WorksheetsRequestHandler::handleRequest();

            case 'prompts':
                PromptsRequestHandler::$responseMode = static::$responseMode;
                return PromptsRequestHandler::handleRequest();

            case 'assignments':
                WorksheetAssignmentsRequestHandler::$responseMode = static::$responseMode;
                return WorksheetAssignmentsRequestHandler::handleRequest();

            case 'my-sections':
                return static::handleMySectionsRequest();

            case 'term-sections':
                return static::handleTermSectionsRequest();

            case 'section-students':
                return static::handleSectionStudentsRequest();

            case 'student-worksheet':
                return static::handleStudentWorksheetRequest();

            default:
                return static::throwNotFoundError();
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

#        \MICS::dump($Term, 'Term Object', true);

        return static::respond('standardsSections', [
            'success' => true,
            'data' => WorksheetAssignment::getAllByQuery(
                'SELECT'
                .' Existing.ID AS ID'
                .' ,"StandardsWorksheetAssignment" AS Class'
                .' ,IFNULL(Existing.Created,CURRENT_TIMESTAMP) AS Created'
                .' ,IFNULL(Existing.CreatorID,%1$u) AS CreatorID'
                .' ,IFNULL(Existing.TermID, %2$u) AS TermID'
                .' ,InstructorPart.CourseSectionID AS CourseSectionID'
                .' ,Existing.WorksheetID'
                .' ,Existing.Description'
                .' FROM course_section_participants InstructorPart'
                .' LEFT JOIN standards_worksheet_assignments Existing ON (Existing.TermID = %2$u AND Existing.CourseSectionID = InstructorPart.CourseSectionID)'
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
                .' ,"%s" AS Class'
                .' ,IFNULL(Existing.Created,CURRENT_TIMESTAMP) AS Created'
                .' ,IFNULL(Existing.CreatorID,%2$u) AS CreatorID'
                .' ,IFNULL(Existing.TermID, %3$u) AS TermID'
                .' ,Section.ID AS CourseSectionID'
                .' ,Existing.WorksheetID'
                .' ,Existing.Description'
                .' FROM course_sections Section'
                .' LEFT JOIN standards_worksheet_assignments Existing ON (Existing.TermID = %3$u AND Existing.CourseSectionID = Section.ID)'
                .' WHERE'
                .'  Section.TermID IN ('
                .'    SELECT parent.ID'
                .'    FROM `%4$s` AS term, `%4$s` AS parent'
                .'    WHERE term.Left BETWEEN parent.Left AND parent.Right AND term.ID = %3$u'
                .'    ORDER BY parent.Left'
                .'  )',
                [
                    \DB::escape(WorksheetAssignment::class),
                    $Session->PersonID,
                    $Term->ID,
                    Term::$tableName
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
            'success' => true,
            'data' => \DB::allRecords(
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
            'TermID IN (' . join(',', $termIDs) . ')',
            'CourseSectionID' => $_REQUEST['courseSectionID']
        ]);

        if (!$WorksheetAssignment) {
            return static::throwError('A worksheet must be assigned to this section before students can be graded');
        }

        // handle post
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $saved = [];
            $failed = [];

            foreach ($_POST AS $key => $value) {
                if (!preg_match('/^prompt-(\d+)$/i', $key, $matches) || !$value) {
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
                    $Grade->save(false);

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
            'success' => true,
            'data' => DB::allRecords(
                'SELECT'
                .' Grade.ID AS ID'
                .' ,"StandardsPromptGrade" AS Class'
                .' ,IFNULL(Grade.Created,CURRENT_TIMESTAMP) AS Created'
                .' ,IFNULL(Grade.CreatorID,%1$u) AS CreatorID'
                .' ,%2$u AS TermID'
                .' ,%3$u AS StudentID'
                .' ,%4$u AS CourseSectionID'
                .' ,"%6$s" AS CourseTitle'
                .' ,WorksheetPrompt.PromptID'
                .' ,Prompt.Prompt AS PromptTitle'
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
                    $WorksheetAssignment->WorksheetID,
                    $WorksheetAssignment->CourseSection->Title
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

        $filename = 'Standards Reports';
        $where = [
            'TermID' => $Term->ID,
            sprintf('EXISTS(SELECT swp.ID FROM standards_worksheet_prompts swp WHERE swp.PromptID = %s.PromptID AND swp.WorksheetID = (SELECT swa.WorksheetID FROM standards_worksheet_assignments swa WHERE swa.TermID = %s.TermID AND swa.CourseSectionID = %s.CourseSectionID))', PromptGrade::getTableAlias(), PromptGrade::getTableAlias(), PromptGrade::getTableAlias())
        ];

        if (!empty($_REQUEST['sectionID']) && is_numeric($_REQUEST['sectionID'])) {
            $where['CourseSectionID'] = $_REQUEST['sectionID'];
#            unset($where['TermID']);
        }

        if (!empty($_REQUEST['advisorID']) && is_numeric($_REQUEST['advisorID']) && ($Advisor = Person::getByID($_REQUEST['advisorID']))) {
            $where[] = 'StudentID IN (SELECT Student.ID FROM people Student WHERE Student.AdvisorID = '.$_REQUEST['advisorID'].')';
            $filename .= ' - '.$Advisor->LastName;
        }

        if (!empty($_REQUEST['studentID']) && is_numeric($_REQUEST['studentID']) && ($Student = Person::getByID($_REQUEST['studentID']))) {
            $where['StudentID'] = $_REQUEST['studentID'];
            $filename .= ' - '.$Student->Username;
        }

        $html = TemplateResponse::getSource('print', [
            'Term' => $Term,
            'data' => PromptGrade::getAllByWhere($where, [
                'order' => 
                    '(SELECT CONCAT(LastName,FirstName) FROM people WHERE people.ID = StudentID]'
                    .', CourseSectionID'
                    .sprintf(', (SELECT Prompt FROM standards_prompts WHERE %s.ID = PromptID)', PromptGrade::getTableAlias()),
                'limit' => (!empty($_REQUEST['limit']) && is_numeric($_REQUEST['limit'])) ? $_REQUEST['limit'] : false
            ])
        ]);

        if (Site::$pathStack[0] == 'preview') {
            die($html);
        }

        $filename .= ' ('.date('Y-m-d').')';
        $filePath = tempnam('/tmp', 'slate_nr_');

        file_put_contents($filePath.'.html', $html);
        $command = "/usr/local/bin/wkhtmltopdf -O Landscape \"$filePath.html\" \"$filePath.pdf\"";

        if (Site::$pathStack[0] == 'stage') {
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

        if (!empty($_REQUEST['advisorID']) && is_numeric($_REQUEST['advisorID']) && ($Advisor = Emergence\People\Person::getByID($_REQUEST['advisorID']))) {
            $where[] = 'StudentID IN (SELECT Student.ID FROM people Student WHERE Student.AdvisorID = '.$_REQUEST['advisorID'].')';
        }

        if (!empty($_REQUEST['studentID']) && is_numeric($_REQUEST['studentID']) && ($Student = Emergence\People\Person::getByID($_REQUEST['studentID']))) {
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
            if ($lastGrade && ($grade->StudentID != $lastGrade->StudentID) ) {
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

    static protected $_emailsSent = 0;
    static protected $_emailTemplate;
    static protected function emailReport(CourseTerm $Term, Person $Student, $grades)
    {
        if (!static::$_emailTemplate) {
            static::$_emailTemplate = TemplateResponse::getInstance()->templateFactory('Emergence', 'email.tpl');
        }

        printf('%u - Generating report for student #%u of %u with %u grades...', static::$_emailsSent, $Student->ID, $Student->GraduationYear, count($grades));

        $subject = 'Your Standards-Based Report Card for '.$Term->Title;

        $html = TemplateResponse::getSource(static::$_emailTemplate, [
            'Term' => $Term,
            'Student' => $Student,
            'data' => $grades
        ]);

        printf("Emailing %u bytes to %s<br>", strlen($html), htmlspecialchars($Student->EmailRecipient));
        flush();

        //Email::send('calfano@scienceleadership.org', $subject, $html);
        $success = Emergence\Mailer\Mailer::send($Student->EmailRecipient, $subject, $html);
        $html = null;
        static::$_emailsSent++;
        return $success;

        //if(static::$_emailsSent >= 5) die('canceling');
    }
}