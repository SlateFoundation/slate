<?php

if ($GLOBALS['Session']->hasAccountLevel('Staff')) {
    Slate\UI\Tools::$tools['Student Progress'] = [
        'Narrative Reports' => [
            '_href' => '/manage#progress/narratives',
            '_icon' => 'documents'
        ]
    ];
}