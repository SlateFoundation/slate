<?php

class EditorRequestHandler extends RequestHandler
{
    public static $activitySessionThreshold = 3600;
    public static $activityPageSize = 100;

    public static $userResponseModes = [
        'application/json' => 'json',
        'text/csv' => 'csv',
    ];

    public static function handleRequest()
    {
        switch ($action ?: $action = static::shiftPath()) {
            case 'revisions':
                return static::handleRevisionsRequest();
            // case 'getCodeMap': // Don't write verbs in the path, HTTP method is the verb!
            //     return static::handleCodeMapRequest($_REQUEST['class']);
            case 'search':
                return static::handleSearchRequest();
            case 'activity':
                return static::handleActivityRequest();
            case 'timesheet':
                return static::handleTimesheetRequest();
            default:
                return static::throwInvalidRequestError();
        }
    }

    public static function handleSearchRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Developer');

        // read content query
        $contentQuery = null;

        if (!empty($_GET['content'])) {
            if (!empty($_GET['contentFormat']) && 'regex' == $_GET['contentFormat']) {
                $contentQuery = $_GET['content'];
            } else {
                $contentQuery = preg_quote($_GET['content'], '/');
            }
        }

        // read case sensitivity
        $caseMatch = false;

        if (!empty($_GET['case']) && 'match' == $_GET['case']) {
            $caseMatch = true;
        }

        // read path prefix
        $path = null;

        if (!empty($_GET['path'])) {
            $path = trim($_GET['path'], '/');
        }

        // read sources/layours include
        $localOnly = true;

        if (!empty($_GET['include'])) {
            $include = is_array($_GET['include']) ? $_GET['include'] : explode(',', $_GET['include']);

            if (in_array('parent', $include)) {
                $localOnly = false;
            }
        }

        // read file conditions
        $fileConditions = [];

        if (!empty($_GET['filename'])) {
            $filename = str_replace('_', '\\_', $_GET['filename']); // escape literal underscores which mean wildcard to LIKE
            $filename = strtr($filename, '*?', '%_'); // translate * and ? wildcards to LIKE equivelents
            $fileConditions[] = 'Handle LIKE "'.DB::escape($filename).'"';
        }

        // read buffers limit
        $contextLimit = 255;

        if (!empty($_GET['contextLimit']) && ctype_digit($_GET['contextLimit'])) {
            $contextLimit = intval($_GET['contextLimit']);
        }

        // query list of files
        $filesByPath = Emergence_FS::getTreeFiles($path, $localOnly, $fileConditions);

        // add Path to each as array value and build mirror by-id index
        $filesById = [];
        foreach ($filesByPath as $path => &$fileData) {
            $fileData['Path'] = $path;
            $fileData['ID'] = intval($fileData['ID']);
            $fileData['CollectionID'] = intval($fileData['CollectionID']);

            $filesById[$fileData['ID']] = &$fileData;
        }

        // filter by content
        if ($contentQuery) {
            // open grep process
            $grepProc = proc_open(
                'xargs grep -nIP '.escapeshellarg(($caseMatch ? '' : '(?i)').$contentQuery),
                [
                    0 => ['pipe', 'r'],
                    1 => ['pipe', 'w'],
                ],
                $pipes,
                Site::$rootPath.'/data'
            );

            // pipe file list into xargs
            foreach ($filesById as $id => $fileData) {
                fwrite($pipes[0], $id.PHP_EOL);
            }
            fclose($pipes[0]);

            // read results from piped output lines
            $results = [];
            while (!feof($pipes[1])) {
                // read grep output
                $outputLine = trim(stream_get_line($pipes[1], 100000000, PHP_EOL));

                if (!$outputLine) {
                    continue;
                }

                // parse grep output
                list($fileId, $line, $content) = explode(':', $outputLine, 3);

                // build match data
                $matchData = [
                    'line' => intval($line),
                ];

                // find position of match within content
                preg_match('/'.$contentQuery.'/'.($caseMatch ? '' : 'i'), $content, $matches, PREG_OFFSET_CAPTURE);

                if ($match = array_shift($matches)) {
                    list($matchSubstring, $matchOffset) = $match;
                    $matchLength = strlen($matchSubstring);

                    // split content by prefix, match, suffix
                    $matchData['prefix'] = substr($content, 0, $matchOffset) ?: '';
                    $matchData['match'] = $matchSubstring;
                    $matchData['suffix'] = substr($content, $matchOffset + $matchLength) ?: '';

                    // apply context limit
                    if ($contextLimit) {
                        $matchData['prefix'] = substr($matchData['prefix'], $contextLimit * -1) ?: '';
                        $matchData['suffix'] = substr($matchData['suffix'], 0, $contextLimit) ?: '';
                    }
                }

                $filesById[$fileId]['ContentMatch'] = $matchData;
                $results[] = $filesById[$fileId];
            }

            // clean up
            fclose($pipes[1]);
            proc_close($grepProc);

        // filter to matches
        } else {
            $results = array_values($filesById);
        }

        // respond with output
        return static::respond('searchResults', [
            'success' => true,
            'total' => count($results),
            'data' => $results,
        ]);
    }

    public static function handleRevisionsRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Developer');

        if (!empty($_REQUEST['ID'])) {
            $node = SiteFile::getByID($_REQUEST['ID']);
        } elseif (!empty($_REQUEST['path'])) {
            $node = Site::resolvePath($_REQUEST['path']);
        }

        if (!$node) {
            return static::throwNotFoundError();
        } else {
            $data = [];
            $fields = [
                'ID',
                'Class',
                'Handle',
                'Type',
                'MIMEType',
                'Size',
                'SHA1',
                'Status',
                'Timestamp',
                'AuthorID',
                'AncestorID',
                'CollectionID',
                'FullPath',
            ];

            foreach ($node->getRevisions() as $item) {
                $record = [];

                foreach ($fields as $field) {
                    $record[$field] = $item->$field;

                    if ('AuthorID' == $field) {
                        $record['Author'] = Person::getByID($item->AuthorID);
                    }
                }
                $data['revisions'][] = $record;
            }

            return static::respond('revisions', $data);
        }
    }

    // public static function handleCodeMapRequest($class=__CLASS__) {
    //     $GLOBALS['Session']->requireAccountLevel('Developer');

    //     $Reflection = new ReflectionClass($class);

    //     $ReflectionMethods = $Reflection->getMethods();

    //     $methods = array();

    //     foreach($ReflectionMethods as $ReflectionMethod)
    //     {
    //         if($ReflectionMethod->class == $class)
    //         {
    //             $methods[] = array(
    //                 //'object' => $ReflectionMethod
    //                 'Method' => $ReflectionMethod->name
    //                 ,'Parameters' => $ReflectionMethod->getParameters()
    //                 ,'StartLine' => $ReflectionMethod->getStartLine()
    //                 ,'EndLine' => $ReflectionMethod->getEndLine()
    //             );
    //         }
    //     }

    //     $data = array(
    //         'Class' => $class
    //         ,'Parent' => $Reflection->getParentClass()
    //         ,'Methods' => $methods
    //     );

    //     return static::respond('codeMap', $data);
    // }

    public static function handleActivityRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Developer');

        if ('all' == static::peekPath()) {
            static::$activityPageSize = false;
        }

        $activity = [];
        $openFiles = [];
        $editResults = DB::query(
            'SELECT f.*'
            .' FROM _e_files f'
            .' JOIN _e_file_collections c ON(c.ID = f.CollectionID)'
            .' WHERE c.Site = "Local"'
            .' ORDER BY ID DESC'
        );

        $closeFile = function ($path) use (&$activity, &$openFiles) {
            list($authorID, $collectionID, $handle) = explode('/', $path, 3);
            $Collection = SiteCollection::getByID($collectionID);
            $Author = Person::getByID($authorID);

            $activity[] = [
                'EventType' => 'save', 'Author' => $Author ? $Author->getData() : null, 'Collection' => $Collection->getData(), 'Handle' => $handle, 'CollectionPath' => $Collection->FullPath, 'Timestamp' => $openFiles[$path][count($openFiles[$path]) - 1]['Timestamp'], 'FirstTimestamp' => $openFiles[$path][0]['Timestamp'], 'RevisionID' => $openFiles[$path][count($openFiles[$path]) - 1]['ID'], 'FirstRevisionID' => $openFiles[$path][0]['ID'], 'FirstAncestorID' => $openFiles[$path][0]['AncestorID'], 'revisions' => $openFiles[$path],
            ];

            unset($openFiles[$path]);
        };

        while ((!static::$activityPageSize || (count($activity) + count($openFiles) < static::$activityPageSize)) && ($editRecord = $editResults->fetch_assoc())) {
            $editRecord['Timestamp'] = strtotime($editRecord['Timestamp']);
            $path = $editRecord['AuthorID'].'/'.$editRecord['CollectionID'].'/'.$editRecord['Handle'];

            if ('Deleted' == $editRecord['Status']) {
                if (array_key_exists($path, $openFiles)) {
                    $closeFile($path);
                }

                $Author = Person::getByID($editRecord['AuthorID']);
                $Collection = SiteCollection::getByID($editRecord['CollectionID']);

                $lastActivity = count($activity) ? $activity[count($activity) - 1] : null;
                if ($lastActivity && 'delete' == $lastActivity['EventType'] && $lastActivity['Author']['ID'] == $Author->ID) {
                    // compound into last activity entry if it was a delete by the same person
                    $activity[count($activity) - 1]['FirstTimestamp'] = $editRecord['Timestamp'];
                    $activity[count($activity) - 1]['files'][] = [
                        'Collection' => $Collection->getData(), 'Handle' => $editRecord['Handle'], 'CollectionPath' => $Collection->FullPath, 'Timestamp' => $editRecord['Timestamp'],
                    ];
                } else {
                    // push new activity
                    $activity[] = [
                        'EventType' => 'delete', 'Author' => $Author ? $Author->getData() : null, 'Timestamp' => $editRecord['Timestamp'], 'files' => [
                            [
                                'Collection' => $Collection->getData(), 'Handle' => $editRecord['Handle'], 'CollectionPath' => $Collection->FullPath, 'Timestamp' => $editRecord['Timestamp'],
                            ],
                        ],
                    ];
                }
            } elseif (array_key_exists($path, $openFiles)) {
                if ($editRecord['Timestamp'] < $openFiles[$path][0]['Timestamp'] - static::$activitySessionThreshold) {
                    $closeFile($path);
                    $openFiles[$path] = [$editRecord];
                } else {
                    array_unshift($openFiles[$path], $editRecord);
                }
            } else {
                $openFiles[$path] = [$editRecord];
            }
        }

        // close any files still open
        $openFileKeys = array_keys($openFiles);
        array_walk($openFileKeys, $closeFile);

        // sort activity by last edit
        usort($activity, function ($a, $b) {
            return ($a['Timestamp'] > $b['Timestamp']) ? -1 : 1;
        });

        return static::respond('activity', [
            'success' => true, 'data' => $activity,
        ]);
    }

    public static function handleTimesheetRequest()
    {
        if ('html' == static::peekPath()) {
            static::$responseMode = 'html';
        }

        $GLOBALS['Session']->requireAccountLevel('Developer');

        $daysLimit = isset($_REQUEST['daysLimit']) ? $_REQUEST['daysLimit'] : 7;
        $gapLimit = isset($_REQUEST['gapLimit']) ? $_REQUEST['gapLimit'] : 1800;
        $minimumSessionDuration = isset($_REQUEST['minimumSessionDuration']) ? $_REQUEST['minimumSessionDuration'] : 120;
        $dayShift = isset($_REQUEST['dayShift']) ? $_REQUEST['dayShift'] : 18000; // 5 hours

        $workDays = [];

        $editResults = DB::query(
            'SELECT UNIX_TIMESTAMP(Timestamp) AS Timestamp, AuthorID'
            .' FROM _e_files f'
            .' WHERE f.AuthorID IS NOT NULL'
            .' ORDER BY ID DESC'
        );

        while ($editRecord = $editResults->fetch_assoc()) {
            $day = date('Y-m-d', $editRecord['Timestamp'] - $dayShift);

            if (!array_key_exists($day, $workDays)) {
                if (count($workDays) == $daysLimit) {
                    break;
                }

                $workDays[$day] = [];
            }

            if (!array_key_exists($editRecord['AuthorID'], $workDays[$day])) {
                $workDays[$day][$editRecord['AuthorID']] = [];
            }

            if (
                !count($workDays[$day][$editRecord['AuthorID']])
                || ($workDays[$day][$editRecord['AuthorID']][0]['firstEdit'] - $gapLimit) > $editRecord['Timestamp']
            ) {
                array_unshift($workDays[$day][$editRecord['AuthorID']], [
                    'firstEdit' => $editRecord['Timestamp'], 'lastEdit' => $editRecord['Timestamp'],
                ]);
            } else {
                $workDays[$day][$editRecord['AuthorID']][0]['firstEdit'] = $editRecord['Timestamp'];
            }
        }

        // compile results
        $results = [];
        foreach ($workDays as $day => $authors) {
//            print("<h1>$day</h1>");
            $dayResults = [
                'date' => $day, 'authors' => [],
            ];

            foreach ($authors as $authorID => $sessions) {
                $authorResults = [
                    'Person' => Person::getByID($authorID), 'totalDuration' => 0, 'sessions' => [],
                ];
//                print("<h2>$Author->FullName</h2><pre>");

                foreach ($sessions as $authorSession) {
                    $authorSession['duration'] = $authorSession['lastEdit'] - $authorSession['firstEdit'];
                    $authorResults['sessions'][] = $authorSession;
//                    printf("%s\t->\t%s\t:\t%s minutes\n", date('g:i:sa', $authorSession['firstEdit']), date('g:i:sa', $authorSession['lastEdit']), number_format($authorSession['duration']/60,1));
                    $authorResults['totalDuration'] += max($authorSession['duration'], $minimumSessionDuration);
                }

                $dayResults['authors'][] = $authorResults;
//                print("</pre><p>".number_format($dayAuthor['duration'] / 60, 1)." minutes estimated total</p>");
            }

            $results[] = $dayResults;
        }

        return static::respond('timesheet', [
            'data' => $results, 'daysLimit' => $daysLimit, 'gapLimit' => $gapLimit, 'minimumSessionDuration' => $minimumSessionDuration, 'dayShift' => $dayShift,
        ]);
    }
}
