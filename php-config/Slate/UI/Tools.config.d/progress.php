<?php

if (empty($GLOBALS['Session']) || !$GLOBALS['Session']->hasAccountLevel('Staff')) {
    return;
}

Slate\UI\Tools::$tools['Student Progress']['Interim Reports'] = [
    '_href' => '/manage#progress/interims/report',
    '_icon' => 'interims'
];

Slate\UI\Tools::$tools['Student Progress']['Term Reports'] = [
    '_href' => '/manage#progress/terms/report',
    '_icon' => 'documents'
];