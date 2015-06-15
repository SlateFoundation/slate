<?php

$GLOBALS['Session']->requireAccountLevel('Staff');

$headers = [
    'Vendor',
    'Make',
    'Model',
    'Serial #',
    'SDP Property #',
    'Assignee',
    'Assignee Year',
    'Assignee Advisor',
    'Location',
    'Status'
];

// init spreadsheet writer
$sw = new SpreadsheetWriter();

// write header
$sw->writeRow($headers);

// enable model caching globally for quick resolution of relationships
ActiveRecord::$useCache = true;

foreach (Slate\Assets\Asset::getAll() AS $Asset) {
    $data = $Asset->Data ?: [];

    $sw->writeRow([
        $data['Vendor'],
        $data['Make'],
        $data['Model'],
        $Asset->MfrSerial->Identifier,
        $Asset->SDPID->Identifier,
        $Asset->Assignee ? $Asset->Assignee->Username : '',
        $Asset->Assignee ? $Asset->Assignee->GraduationYear : '',
        $Asset->Assignee && $Asset->Assignee->Advisor ? $Asset->Assignee->Advisor->Username : '',
        $Asset->Location->Title,
        $Asset->Status->Title
    ]);
}

$sw->close();