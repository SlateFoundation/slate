<?php

function Dwoo_Plugin_micstext(Dwoo_Core $dwoo, $text, $mode = 'format')
{
    return Format::micsText($text, $mode);
}