<?php

function Dwoo_Plugin_strip_parens(Dwoo_Core $dwoo, $input)
{
    return trim(preg_replace('/\([^)]*\)/','',$input));
}
