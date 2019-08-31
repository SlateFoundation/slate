<?php

function Dwoo_Plugin_format_timerange(Dwoo_Core $dwoo, $from, $to, $seperator = '&ndash;', $shortMonth = false, $html = false, $forceYear = false, $ordinalSuffix = true, $includeTooltips = true)
{
    $fromTime = is_numeric($from) ? $from : strtotime($from);
    $toTime = is_numeric($to) ? $to : strtotime($to);

    $from = getdate(min($fromTime, $toTime));
    $to = getdate(max($fromTime, $toTime));

    $from['m'] = $from['hours']<=12?'am':'pm';
    $to['m'] = $to['hours']<=12?'am':'pm';

    $from['hours'] %= 12;
    $to['hours'] %= 12;

    $dayFormat = $ordinalSuffix ? 'jS' : 'j';
    $monthFormat = $shortMonth ? 'M' : 'F';
    $startDateYearFormat = $from['year'] != $to['year'] || $from['year'] != date('Y') ? ', Y' : '';
    $endDateYearFormat = $from['year'] != $to['year'] || $to['year'] != date('Y') || $forceYear? ', Y' : '';

    $fromString = '';
    $toString = '';

    if ($from['year'] != $to['year'] || $from['mon'] != $to['mon']) {
        // diff year or diff month
        $fromString = date($monthFormat.' '.$dayFormat.$startDateYearFormat, $from[0]);
        $toString = date($monthFormat.' '.$dayFormat.$endDateYearFormat, $to[0]);
    } elseif ($from['mday'] != $to['mday']) {
        // same month, diff day
        $fromString = date($monthFormat.' '.$dayFormat, $from[0]);
        $toString = date($dayFormat.$endDateYearFormat, $to[0]);
    } elseif ($from['m'] != $to['m']) {
        // same day, diff am/pm
        $fromString = sprintf('%u:%02u%s', $from['hours'], $from['minutes'], $from['m']);
        $toString = sprintf('%u:%02u%s', $to['hours'], $to['minutes'], $to['m']);
    } else { //if($from['hours'] != $to['hours'])
        // same am/pm
        $fromString = sprintf('%u:%02u', $from['hours'], $from['minutes']);
        $toString = sprintf('%u:%02u%s', $to['hours'], $to['minutes'], $to['m']);
    }

    if ($html) {
        $fromString = sprintf('<time datetime="%s" title="%s" class="dtstart">%s</time>', date(DATE_W3C, $from[0]), $includeTooltips ? date('l jS \of F Y h:i:s A', $from[0]) : '', $fromString);
        $toString = sprintf('<time datetime="%s" title="%s" class="dtend">%s</time>', date(DATE_W3C, $to[0]), $includeTooltips ? date('l jS \of F Y h:i:s A', $to[0]) : '', $toString);
    }

    return $fromString.$seperator.$toString;
}