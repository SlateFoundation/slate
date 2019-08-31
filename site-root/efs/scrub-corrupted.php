<?php

$GLOBALS['Session']->requireAccountLevel('Developer');

$files = DB::query('SELECT * FROM _e_files');

$count = 0;
while ($file = $files->fetch_assoc()) {
    $count++;
    $filePath = $_SERVER['SITE_ROOT'].'/data/'.$file['ID'];

    if (!file_exists($filePath)) {
        if ($file['Status'] == 'Deleted') {
            continue;
        }

        print("Deleting missing file from DB: $file[Handle] - $file[ID]<br>\n");
        DB::nonQuery('DELETE FROM _e_files WHERE ID = '.$file['ID']);
        continue;
    }

    $fp = fopen($filePath, 'r');
    $in = fread($fp, 256);

    if (
        strpos($in, '<h1>Unhandled Exception</h1><p>Exception: Failed to query parent site for file') === 0
        || strpos($in, "\nParse error: syntax error") === 0
    ) {
        print("Deleting corrupt file from DB and fs: $file[Handle] - $file[ID]<br>\n");
        unlink($filePath);
        DB::nonQuery('DELETE FROM _e_files WHERE ID = '.$file['ID']);
    }

    fclose($fp);
}

die("Looked at $count files");