<?php

SearchRequestHandler::$searchClasses[Slate\Courses\Section::class] = [
    'fields' => [
        'Title',
        [
            'field' => 'Code',
            'method' => 'like'
        ]
    ],
    'conditions' => [
        'Status' => 'Live'
    ]
];