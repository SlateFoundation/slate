<?php
namespace Slate\Progress;

use DB;
use Emergence\People\Person;
use Slate\Term;

class ProgressRequestHandler extends \RequestHandler
{
    public static $userResponseModes = [
        'application/json' => 'json',
        'application/pdf' => 'pdf'
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

        $Person = Person::getByID($_REQUEST['StudentID']);

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


        // if (static::peekPath() == 'export') {
        //     static::shiftPath();
        //     $summarizeRecords = false;
        // }

        $records = static::getProgressRecords($reportTypes, $params, static::getResponseMode() == 'json', $search);

        usort($records, function($r1, $r2) {
            return (strtotime($r2['Date']) - strtotime($r1['Date']));
        });


        // if (!$summarizeRecords) {
        //     $html = \TemplateResponse::getSource('reports/export', [
        //         'data' => $records
        //     ]);

        //     $filename .= $Person->FullName.' ('.date('Y-m-d').')';
        //     $filePath = tempnam('/tmp', 'slate_nr_');

        //     file_put_contents($filePath.'.html', $html);
        //     $command = "xvfb-run --server-args=\"-screen 0, 1024x768x24\" wkhtmltopdf \"$filePath.html\" \"$filePath.pdf\"";

        //     exec($command);

        //     $tokenName = 'downloadToken';
        //     if (!empty($_REQUEST[$tokenName])) {
        //         setcookie($tokenName, $_REQUEST[$tokenName], time()+300, '/');
        //     }

        //     header('Content-Type: application/pdf');
        //     header("Content-Disposition: attachment; filename=\"$filename.pdf\"");
        //     readfile($filePath.'.pdf');
        //     exit();
        // } else {
            return static::respond('progress', [
                'data' => $records
            ]);
        // }
    }

    protected static function getProgressRecords($reportTypes, $params, $summarizeRecords = true,  $search = false)
    {
        $records = [];

        foreach ($reportTypes as $reportType) {
            switch ($reportType) {
                case 'progressnotes':
                {
                    $records = $summarizeRecords ? array_merge($records, static::getProgressNotesSummary($params, $search)) : array_merge($records, static::getProgressNotes($params, $search));
                    break;
                }

            }
        }

        return $records;
    }

    protected static function getProgressSearchConditions($reportType, $search)
    {
        $reportSearchTerms = [
            'qualifierConditions' => []
            ,'mode' => 'AND'
        ];

        $terms = preg_split('/\s+/', $search);

        foreach ($terms AS $term) {
            $n = 0;
            $qualifier = 'any';
            $split = explode(':', $term, 2);

            if (empty($term)) {
                continue;
            }

            if (count($split) == 2) {
                $qualifier = strtolower($split[0]);
                $term = $split[1];
            }

            if ($qualifier == 'mode' && $term == 'or') {
                $reportSearchTerms['mode'] = 'OR';
            }

            if ($reportType == 'Standards' && $qualifier == 'course') {
                return [
                    'qualifierConditions' => [
                        'course' => [
                            'Sections.Handle="'.$term.'"'
                        ]
                    ]
                    ,'mode' => 'AND'
                ];
                //Reports will only have course section functionality for now. This is temporary.
            } elseif ($reportType == 'Standards' && $qualifier == 'any') {
                continue;
            } elseif ($reportType == 'Standards') {
                return [
                    'qualifierConditions' => []
                    ,'mode' => 'AND'
                ];
            }

            foreach (static::$progressSearchConditions[$reportType] AS $k => $condition) {
                if (!in_array($qualifier, $condition['qualifiers'])) {
                    continue;
                }

                $sqlCondition = !empty($condition['sql']) ? sprintf($condition['sql'], \DB::escape($term)) : false;

                $matchers[] = [
                    'condition' => $sqlCondition
                    ,'points' => $condition['points']
                    ,'qualifier' => $qualifier
                ];
            }
        }

        if ($matchers) {
            foreach ($matchers AS $matcher) {
                if (!is_array($reportSearchTerms['qualifierConditions'][$matcher['qualifier']])) {
                    $reportSearchTerms['qualifierConditions'][$matcher['qualifier']] = [];
                }

                $reportSearchTerms['qualifierConditions'][$matcher['qualifier']][] = $matcher['condition'];
            }
        }

        return $reportSearchTerms;
    }

    protected static function getProgressNotesSummary($params, $search = false)
    {
        $sql = 'SELECT %s FROM `%s` Note LEFT JOIN `%s` People ON (People.ID = Note.AuthorID)  WHERE (%s) HAVING (%s)';

        $having = [];
        $select = [
            'Note.ID'
            ,'Note.Class'
            ,'Note.Subject'
            ,'Sent AS Date'
            ,'People.Username AS AuthorUsername'
        ];

        $queryParams = [
            Note::$tableName
            ,Person::$tableName
        ];

        $termCondition = $params['Term'] == 'All' ? false : 'DATE(Note.Created) BETWEEN "'.$params['Term']->StartDate.'" AND "'.$params['Term']->EndDate.'"';

        $conditions = [
            'ContextID='.$params['StudentID']
            ,'ContextClass="'.\DB::escape(Person::class).'"'
        ];

        if ($termCondition) {
            $conditions[] = $termCondition;
        }

        if ($search) {
            $matchedSearchConditions = static::getProgressSearchConditions('ProgressNote', $search);
            $searchConditions = [];

            if (!empty($matchedSearchConditions['qualifierConditions'])) {
                foreach ($matchedSearchConditions['qualifierConditions'] as $qualifierConditions) {
                    $conditionString = '( ('.implode(') OR (', $qualifierConditions).') )';

                    if ($matchedSearchConditions['mode'] == 'OR') {
                        $searchConditions = array_merge($searchConditions, $qualifierConditions);
                    } else {
                        $conditions[] = $conditionString;
                    }
                }
            }

            if ($matchedSearchConditions['mode'] == 'OR') {
                $select[] = implode('+', array_map(function($c) {
                    return sprintf('IF(%s, %u, 0)', $c, 1);
                }, $searchConditions)).' AS searchScore';

                $having[] = 'searchScore >= 1';
            }
        }

        array_unshift($queryParams, implode(',', $select));
        $queryParams[] = $conditions ? implode(' AND ', $conditions) : '1';
        $queryParams[] = empty($having) ? '1' : join(' AND ', $having);

        return DB::allRecords($sql, $queryParams);
    }

    protected static function getProgressNotes($params, $search = false)
    {
        $sql = 'SELECT %s FROM `%s` WHERE (%s) HAVING (%s)';

        $having = [];
        $select = [
            'Class'
            ,'Subject'
            ,'Sent AS Date'
            ,'Message'
            ,'MessageFormat'
            ,'AuthorID'
            ,'ContextClass'
            ,'ContextID'
        ];

        $queryParams = [
             Note::$tableName
        ];

        $termCondition = $params['Term'] == 'All' ? false : 'DATE(Created) BETWEEN "'.$params['Term']->StartDate.'" AND "'.$params['Term']->EndDate.'"';

        $conditions = [
            'ContextID='.$params['StudentID']
            ,'ContextClass="'.\DB::escape(Person::class).'"'
        ];

        if ($termCondition) {
            $conditions[] = $termCondition;
        }

        if ($search) {
            $matchedSearchConditions = static::getProgressSearchConditions('ProgressNote', $search);

            $searchConditions = [];

            if (!empty($matchedSearchConditions['qualifierConditions'])) {
                foreach ($matchedSearchConditions['qualifierConditions'] as $qualifierConditions) {
                    $conditionString = '( ('.implode(') OR (', $qualifierConditions).') )';

                    if ($matchedSearchConditions['mode'] == 'OR') {
                        $searchConditions = array_merge($searchConditions, $qualifierConditions);
                    } else {
                        $conditions[] = $conditionString;
                    }
                }
            }

            if ($matchedSearchConditions['mode'] == 'OR') {
                $select[] = implode('+', array_map(function($c) {
                    return sprintf('IF(%s, %u, 0)', $c, 1);
                }, $searchConditions)).' AS searchScore';

                $having[] = 'searchScore >= 1';
            }
        }

        array_unshift($queryParams, implode(',', $select));
        $queryParams[] = $conditions ? implode(' AND ', $conditions) : '1';
        $queryParams[] = empty($having) ? '1' : join(' AND ', $having);

        $notes = array_map(function($note) {
            return array_merge($note->getData(), [
                'AuthorFullName' => $note->Author->FullName,
                'AuthorEmail' => $note->Author->Email,
                'StudentFullName' => $note->Context->FullName
            ]);
        }, Note::getAllByQuery($sql, $queryParams));


        return $notes;
    }
}