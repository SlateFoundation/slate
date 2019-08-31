<?php

// Gracias http://blog.thetonk.com/archives/fuzzy-time and Andrew Collington

function Dwoo_Plugin_fuzzy_time(Dwoo_Core $dwoo, $time)
{
    return Format::fuzzyTime($time);
}