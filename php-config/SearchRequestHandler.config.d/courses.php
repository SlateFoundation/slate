<?php

SearchRequestHandler::$searchClasses[Slate\Courses\Course::class] = [
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