<?php

SearchRequestHandler::$searchClasses[Tag::class] = [
    'weight' => 1000,
    'fields' => [
        'Title',
        [
            'field' => 'Handle',
            'method' => 'like'
        ]
    ]
];
