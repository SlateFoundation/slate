<?php

if (empty($_COMMAND['ARGS'])) {
    die('Usage: flags:disable <key>');
}

$key = $_COMMAND['ARGS'];
Cache::delete("flags/{$key}");

$_COMMAND['LOGGER']->info("Deleted flags/{key}", compact('key'));
