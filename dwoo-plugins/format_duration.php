<?php

function Dwoo_Plugin_format_duration(Dwoo_Core $dwoo, $seconds, $showUnits = true)
{
    $minutes = floor($seconds / 60);
    $seconds = $seconds % 60;

    $string = sprintf('%u:%02u', $minutes, $seconds);

    if ($showUnits) {
        $string .= 'min';
    }

    return $string;
}


?>