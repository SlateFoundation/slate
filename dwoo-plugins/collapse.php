<?php



function Dwoo_Plugin_collapse(Dwoo_Core $dwoo, $string)
{
    return preg_replace('/\s+/', ' ', $string);
}

