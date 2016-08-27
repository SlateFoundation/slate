<?php

SearchRequestHandler::$searchClasses[Emergence\Events\Event::class] = [
    'fields' => [
        'Title',
        'Description',
        [
            'field' => 'Handle',
            'method' => 'like'
        ]
    ],
    'conditions' => [
        'Status' => 'Published'
    ]
];