<?php

namespace Slate\UI;

// add your custom tool links here for the omnibar and dasboard
// Tools::$tools['Example Tool'] = 'http://example.com/';

Tools::$tools['Standards-Based Grading'] = [
    'Narratives' => [
        '_href' => '/manage#progress/narratives',
        '_icon' => 'documents'
    ],
    'Standards' => [
        '_href' => '/manage#progress/standards',
        '_icon' => 'clipboard'
    ],
    'Interims' => [
        '_href' => '/manage#progress/interims',
        '_icon' => 'interims'
    ],
    'Progress Notes' => [
        '_href' => '/manage#progress/notes',
        '_icon' => 'notes'
    ],
    'Growth Dashboard' => [
        '_href' => '/sbg/dashboard',
        '_icon' => 'area-chart'
    ]
];

Tools::$tools['Competency-Based Learning'] = [
    '_icon' => 'cbl',
    'Teacher Dashboard' => [
        '_href' => '/cbl/teacher-dashboard'
    ],
    'Exports' => [
        '_icon' => 'export',
        'Demonstrations' => '/cbl/exports/demonstrations.csv',		
        'Progress' => [
            '_href' => '/cbl/exports/progress.csv',
            '_icon' => 'bar-chart'
        ]
    ]
];

Tools::$tools['Assets'] = [
    'Manager' => [
        '_href' => '/manage#assets',
        '_icon' => 'network'
    ],
    'My Assets' => [
        '_href' => '/assets?set=mine',
        '_icon' => 'binoculars'
    ],
    'Classroom Assets' => [
        '_href' => '/assets?set=classroom',
        '_icon' => 'telescope'
    ]
];

Tools::$tools['Cool People'] = [
    '_icon' => 'user',
    '_children' => \Emergence\People\Person::getAll()
];