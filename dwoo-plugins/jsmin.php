<?php

function Dwoo_Plugin_jsmin(Dwoo_Core $dwoo, $files, $root = array('site-root','js'), $embed = false, $debug = false)
{
    if (is_array($files)) {
        $files = implode('+', $files);
    }

    // analyze tree to obtain hash and file map
    $sourceReport = MinifiedRequestHandler::getSourceReport($files, $root, 'application/javascript');

    if ($debug || !empty($_GET['js-debug']) || !empty($_GET['jsdebug'])) {
        $html = '';
        foreach ($sourceReport['files'] AS $filename => $fileData) {
            $html .= "<script src='".preg_replace('/^site-root/', '', $filename)."?_sha1=$fileData[SHA1]'></script>\n";
        }

        return $html;
    }

    if ($embed) {
        return '<script>'.MinifiedRequestHandler::getSourceCode('JSMin', $sourceReport).'</script>';
    } else {
        return "<script src='/min/js/$files?_sha1=$sourceReport[hash]'></script>";
    }
}