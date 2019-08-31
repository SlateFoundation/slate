<?php

$GLOBALS['Session']->requireAccountLevel('Developer');

$requestData = JSON::getRequestData();

if (!is_array($requestData['nodes'])) {
    JSON::error('Expecting array under nodes key');
}

// TODO: something more elegant to prevent non-specified classes from being inherited?
Site::$autoPull = true;

$succeeded = array();
$failed = array();

foreach ($requestData['nodes'] AS $updateData) {
    $Node = Site::resolvePath($updateData['path']);

    if ($Node->Collection->Site == 'Local') {
        $failed[] = array(
            'path' => $updateData['path']
            ,'error' => 'CURRENT_IS_LOCAL'
            ,'message' => 'Current node is local and blocks any remote updates'
        );
        continue;
    }

    if ($Node->SHA1 != $updateData['localSHA1']) {
        $failed[] = array(
            'path' => $updateData['path']
            ,'error' => 'LOCAL_SHA1_MISMATCH'
            ,'message' => 'Current node\'s SHA1 hash does not match that which this update was requested for'
        );
        continue;
    }

    if (empty($updateData['remoteSHA1'])) {
        $Node->delete();
    } else {
        $NewNode = Emergence::resolveFileFromParent($Node->Collection, $Node->Handle, true);

        if (!$NewNode) {
            $failed[] = array(
                'path' => $updateData['path']
                ,'error' => 'DOWNLOAD_FAILED'
                ,'message' => 'The remote file failed to download'
            );
            continue;
        }

        if ($NewNode->SHA1 != $updateData['remoteSHA1']) {
            $NewNode->destroyRecord();
            $failed[] = array(
                'path' => $updateData['path']
                ,'error' => 'REMOTE_SHA1_MISMATCH'
                ,'message' => 'Downloaded node\'s SHA1 hash does not match that which this update was requested for'
            );
            continue;
        }
    }

    $succeeded[] = $updateData['path'];
}

JSON::respond(array(
    'succeeded' => $succeeded
    ,'failed' => $failed
));