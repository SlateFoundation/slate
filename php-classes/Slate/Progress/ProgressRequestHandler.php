<?php
namespace Slate\Progress;

use Emergence\People\Person;
use Slate\Term;

class ProgressRequestHandler extends \RequestHandler
{
    public static $userResponseModes = [
        'application/json' => 'json'
    ];

    public static $searchConditions = [
        'ProgressNote' => [
            'Subject' => [
                'qualifiers' => ['any'],
                'sql' => 'Subject LIKE "%%%s%%"'
            ],
            'Message' => [
                'qualifiers' => ['any'],
                'sql' => 'Message Like "%%%s%%"'
            ],
            'Author' => [
                'qualifiers' => ['author'],
                'sql' => 'AuthorID = (SELECT Author.ID FROM `people` Author WHERE Author.Username = "%s")'
            ]
        ],
        'Narrative' => [
            'Assessment' => [
                'qualifiers' => ['any'],
                'sql' => 'Assessment LIKE "%%%s%%"'
            ],
            'Comments' => [
                'qualifiers' => ['any'],
                'sql' => 'Comments Like "%%%s%%"'
            ],
            'Author' => [
                'qualifiers' => ['author'],
                'sql' => 'Narrative.CreatorID = (SELECT Author.ID FROM `people` Author WHERE Author.Username = "%s")'
            ],
            'Course' => [
                'qualifiers' => ['course'],
                'sql' => 'Narrative.CourseSectionID = (SELECT Course.ID FROM `course_sections` Course WHERE Course.Handle = "%s")'
            ]
        ],
        'Interim' => [
            'Comments' => [
                'qualifiers' => ['any'],
                'sql' => 'Comments Like "%%%s%%"'
            ],
            'Author' => [
                'qualifiers' => ['author'],
                'sql' => 'Interim.CreatorID = (SELECT Author.ID FROM people Author WHERE Author.Username = "%s")'
            ],
            'Course' => [
                'qualifiers' => ['course'],
                'sql' => 'Interim.CourseSectionID = (SELECT Course.ID FROM `course_sections` Course WHERE Course.Handle = "%s")'
            ]
        ]
    ];

    public static function handleRequest()
    {
        return static::handleProgressRequest();
    }

    public static function handleProgressRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');

        if (!$_REQUEST['StudentID'] || !ctype_digit($_REQUEST['StudentID'])) {
            return static::throwError('Must supply Student ID');
        }

        $params = [
            'StudentID' => $_REQUEST['StudentID']
        ];
        $summarizeRecords = true;

        $Person = Person::getByID($_REQUEST['StudentID']);

        if (!$Person->isA(\Slate\People\Student::class)) {
            return static::throwError($Person->FullName.' is not a student. Please select a different user');
        }

        if ((empty($_REQUEST['termID']) && $_REQUEST['termID'] != 0) || !is_numeric($_REQUEST['termID'])) {
            $params['Term'] = Term::getCurrent();
        } elseif ($_REQUEST['termID'] == 0) {
            $params['Term'] = 'All';
        } elseif (!$params['Term'] = Term::getByID($_REQUEST['termID'])) {
            return static::throwNotFoundError('Term not found');
        }

        $reportTypes = is_string($_REQUEST['reportTypes']) ? [$_REQUEST['reportTypes']] : $_REQUEST['reportTypes'];

        if (empty($reportTypes)) {
            return static::throwError('Must supply report types');
        }

        $search = !empty($_REQUEST['q']) ? $_REQUEST['q'] : false;


        if (static::peekPath() == 'export') {
            static::shiftPath();
            $summarizeRecords = false;
        }

        $records = $Person->getProgressRecords($reportTypes, $params, $summarizeRecords, $search);

        usort($records, function($r1, $r2) {
            return (strtotime($r2['Date']) - strtotime($r1['Date']));
        });


        if (!$summarizeRecords) {
            $html = \TemplateResponse::getSource('reports/export', [
                'data' => $records
            ]);

            $filename .= $Person->FullName.' ('.date('Y-m-d').')';
            $filePath = tempnam('/tmp', 'slate_nr_');

            file_put_contents($filePath.'.html', $html);
            $command = "xvfb-run --server-args=\"-screen 0, 1024x768x24\" wkhtmltopdf \"$filePath.html\" \"$filePath.pdf\"";

            exec($command);

            $tokenName = 'downloadToken';
            if (!empty($_REQUEST[$tokenName])) {
                setcookie($tokenName, $_REQUEST[$tokenName], time()+300, '/');
            }

            header('Content-Type: application/pdf');
            header("Content-Disposition: attachment; filename=\"$filename.pdf\"");
            readfile($filePath.'.pdf');
            exit();
        } else {
            return static::respond('progress', [
                'data' => $records
            ]);
        }
    }
}