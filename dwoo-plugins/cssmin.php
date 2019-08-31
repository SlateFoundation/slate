<?php

function Dwoo_Plugin_cssmin(Dwoo_Core $dwoo, $files, $root = array('site-root','css'), $embed = false, $debug = false)
{
    if (is_array($files)) {
        $files = implode('+', $files);
    }

    // analyze tree to obtain hash and file map
    $sourceReport = MinifiedRequestHandler::getSourceReport($files, $root, 'text/css');

    if ($debug || !empty($_GET['css-debug']) || !empty($_GET['cssdebug'])) {
        $html = '';
        foreach ($sourceReport['files'] AS $filename => $fileData) {
            $html .= "<link rel='stylesheet' type='text/css' href='".preg_replace('/^site-root/', '', $filename)."?_sha1=$fileData[SHA1]'>\n";
        }

        return $html;
    }

    if ($embed) {
        return '<style>'.MinifiedRequestHandler::getSourceCode('CssMin', $sourceReport).'</style>';
    } else {
        return "<link rel='stylesheet' type='text/css' href='/min/css/$files?_sha1=$sourceReport[hash]'>";
    }
}