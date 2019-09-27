<?php

function Dwoo_Plugin_log_report(Dwoo_Core $dwoo, $groupers = array())
{
    if (empty($GLOBALS['Session']) || !$GLOBALS['Session']->hasAccountLevel('Developer') || empty($_GET['log_report'])) {
        return '';
    }

    $groupers = array_merge(array(
        '/SELECT \* FROM `_e_file_collections` WHERE \(Handle = "[^"]+"\) AND .* LIMIT 1/'
        ,'/SELECT \* FROM `_e_files` WHERE CollectionID = \d+ AND Handle = "[^"]+\.config\.php" ORDER BY ID DESC LIMIT 1/'
        ,'/SELECT \* FROM `_e_files` WHERE CollectionID = \d+ AND Handle = "[^"]+\.class\.php" ORDER BY ID DESC LIMIT 1/'
        ,'/SELECT \* FROM `_e_files` WHERE CollectionID = \d+ AND Handle = "[^"]+" ORDER BY ID DESC LIMIT 1/'
        ,'/SELECT \* FROM `media` WHERE `ID` = "\d+" LIMIT 1/'
    ), $groupers);



    $html = '<table border="1" width="100%">';
    $html .= '<tr><th colspan="4">Site log report</th></tr>';

    $totalQueries = 0;
    $totalQueryTime = 0;
    $totalResults = 0;
    $totalAffected = 0;
    $groups = array();
    $reportStart = microtime(true);

    // analyze query stats
    foreach (Debug::$log AS $l) {
        $totalQueries++;
        $totalQueryTime += $l['time_duration_ms'];
        $totalResults += $l['result_rows'];
        $totalAffected += $l['affected_rows'];

        // try to group
        $group = false;
        foreach ($groupers AS $grouper) {
            if (preg_match($grouper, $l['query'])) {
                $group = $grouper;
                break;
            }
        }

        if (!$group) {
            $group = $l['query'];
        }

        $groups[$group]['count']++;
        $groups[$group]['queryTime'] += $l['time_duration_ms'];
        $groups[$group]['results'] += $l['result_rows'];
        $groups[$group]['affected'] += $l['affected_rows'];

        if ($group != $l['query'] && $_GET['log_report'] == 'all') {
            $groups[$group]['queries'][] = $l['query'];
        }
    }


    $reportEnd = microtime(true);

    $html .= '<tr><th>Count</th><th>Time</th><th>Results</th><th>Affected</th></tr>';

    $html .= sprintf('<tr><td colspan="4">Total request time %0.3fms</td></tr>', $reportEnd-Site::$initializeTime);
    $html .= sprintf('<tr><td align="center">%u</td><td align="center">%0.3fms</td><td align="center">%u</td><td align="center">%u</td></tr>', $totalQueries, $totalQueryTime, $totalResults, $totalAffected);

    foreach ($groups AS $query => $g) {
        $html .= sprintf('<tr><td colspan="4">%s</td></tr>', htmlspecialchars($query));
        $html .= sprintf('<tr><td align="center">%u</td><td align="center">%0.3fms</td><td align="center">%u</td><td align="center">%u</td></tr>', $g['count'], $g['queryTime'], $g['results'], $g['affected']);

        if (!empty($g['queries'])) {
            foreach ($g['queries'] AS $query) {
                $html .= '<tr><td colspan="4">'.htmlspecialchars($query).'</td></tr>';
            }
        }
    }

    $html .= sprintf('<tr><th colspan="4">Report took %0.3fms to generate</th></tr>', $reportEnd-$reportStart);
    $html .= '</table>';
    return $html;
}

