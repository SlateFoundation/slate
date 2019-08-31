<?php

$eventContext = $_EVENT['CONTEXT'];


if (
    array_shift($eventContext) != 'Emergence'
    || array_shift($eventContext) != 'FS'
    || array_shift($eventContext) != 'webapp-builds'
    || !($appName = array_shift($eventContext))
    || array_shift($eventContext) != 'app.json'
    || count($eventContext)
) {
    return;
}


return Cache::delete("sencha-app/{$appName}");