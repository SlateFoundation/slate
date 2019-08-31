<?php

function Dwoo_Plugin_html_time(Dwoo_Core $dwoo, $timestamp)
{
    return strftime('%Y-%m-%dT%H:%M:%S%z', $timestamp);
}