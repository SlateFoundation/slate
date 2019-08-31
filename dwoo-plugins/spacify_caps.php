<?php

function Dwoo_Plugin_spacify_caps(Dwoo_Core $dwoo, $text)
{
    return Inflector::spacifyCaps($text);
}