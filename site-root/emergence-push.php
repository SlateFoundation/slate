<?php

$GLOBALS['Session']->requireAccountLevel('Developer');
set_time_limit(0);

RequestHandler::$responseMode = 'json';

if (empty($_REQUEST['path'])) {
    RequestHandler::throwError('path required');
}

if (empty($_REQUEST['host'])) {
    RequestHandler::throwError('host required');
}

if (!$sourceCollection = Site::resolvePath($_REQUEST['path'])) {
    RequestHandler::throwError('path not found locally');
}

// create stream context for remote server
$syncer = new EmergenceSyncer([
    'host' => $_REQUEST['host'], 'authUsername' => $_SERVER['PHP_AUTH_USER'], 'authPassword' => $_SERVER['PHP_AUTH_PW'],
]);

$diff = $syncer->diffCollection($sourceCollection, !empty($_REQUEST['deep']));

if (empty($_REQUEST['push'])) {
    RequestHandler::respond('diff', [
        'diff' => $diff,
    ]);
} else {
    $result = $syncer->pushDiff($diff);
    RequestHandler::respond('pushComplete', [
        'result' => $result,
    ]);
}
