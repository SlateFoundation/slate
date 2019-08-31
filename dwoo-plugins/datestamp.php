<?php

function Dwoo_Plugin_datestamp(Dwoo_Core $dwoo, $time = null)
{
    $this_year = date('Y');
    $this_day = date('z');

    if (empty($time) || (!is_numeric($time) && !($time = strtotime($time)))) {
        $time = time();
        $that_year = $this_year;
        $that_day = $this_day;
    } else {
        $that_time = $time;
        $that_year = date('Y', $time);
        $that_day = date('z', $time);
    }



    if ($that_year == $this_year) {
        // this year

        if ($that_day == $this_day) {
            // today

            return date('g:i a', $that_time);
        } elseif (($this_time - $that_time) <  86400 * 3) {
            // Less than 3 days ago

            return date('l, M j g:i a', $that_time);
        } else {
            // any other time this year

            return date('D, M j', $that_time);
        }
    } else {
        // prior years

        return date('M j, Y', $that_time);
    }
}
