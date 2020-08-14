<?php

if (empty($_COMMAND['ARGS'])) {
    die('Usage: flags:enable <key> [value]');
}

list ($key, $value) = preg_split('/\s+/', $_COMMAND['ARGS'], 2);

if (empty($value)) {
    $value = true;
}

Cache::store("flags/{$key}", $value);

$_COMMAND['LOGGER']->info("Set flags/{key}={value}", compact('key', 'value'));
