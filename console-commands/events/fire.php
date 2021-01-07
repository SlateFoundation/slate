<?php

if (empty($_COMMAND['ARGS'])) {
    die('Usage: events:fire <event> <context> [payload_json]');
}

// parse input
list ($event, $context, $payload) = preg_split('/\s+/', $_COMMAND['ARGS'], 3);
$payload = !empty($payload) ? json_decode($payload, true) : [];

$_COMMAND['LOGGER']->info("Firing {event}@{context}", compact('event', 'context', 'payload'));

// fire event
$result = Emergence\EventBus::fireEvent($event, $context, $payload);
