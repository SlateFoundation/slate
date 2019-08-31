<?php

function Dwoo_Plugin_bytes(Dwoo_Core $dwoo, $bytes, $precision = 2, array $rest = [])
{
    $rest['precision'] = $precision;

    return Emergence\Util\ByteSize::format($bytes, $rest);
}