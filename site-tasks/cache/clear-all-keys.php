<?php

return [
    'title' => 'Clear all application cache keys',
    'description' => 'Clear all in-memory cache keys for the current site',
    'warning' => 'This operation could render the site unresponsive if executed during high load',
    'icon' => 'eraser',
    'requireAccountLevel' => 'Administrator',
    'handler' => function () {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $keysDeleted = Cache::deleteByPattern('/.*/');

            return static::respond('message', [
                'title' => 'Site cache cleared',
                'message' => "Cleared $keysDeleted cache entries"
            ]);
        }

        return static::respond('confirm', [
            'question' => 'Clear all in-memory cache keys for this site?'
        ]);
    }
];