<?php

function Dwoo_Plugin_macaddr_compile(Dwoo_Compiler $compiler, $value)
{
    return 'join(\':\', str_split(strtolower('.$value.'), 2))';
}
