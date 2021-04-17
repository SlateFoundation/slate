<?php

if (empty($_COMMAND['ARGS'])) {
    die('Usage: events:fire <event> <context> [payload_json]');
}

// parse input
list ($event, $context, $payload) = preg_split('/\s+/', $_COMMAND['ARGS'], 3);
$payload = !empty($payload) ? json_decode($payload, true) : [];

$_COMMAND['LOGGER']->info("Firing {event}@{context}", compact('event', 'context', 'payload'));

// fire event
$event = Emergence\EventBus::fireEvent($event, $context, $payload);

// print results
foreach ($event['RESULTS'] as $handler => $result) {
    $_COMMAND['LOGGER']->debug("Result for handler {handler}:", compact('handler'));
    $result = print_r($result, true);

    if ($output = trim($result)) {
        $output = explode(PHP_EOL, $output);
        foreach ($output as $line) {
            $_COMMAND['LOGGER']->debug("    $line");
        }
    }
}
