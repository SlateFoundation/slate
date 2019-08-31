<?php

function Dwoo_Plugin_phone(Dwoo_Core $dwoo, $input, $format = '(%s) %s-%s')
{
    return Format::usPhone($input, $format);
}
