<?php

function Dwoo_Plugin_refill_query(Dwoo_Core $dwoo, array $rest=array())
{
    return http_build_query(array_merge($_GET, $rest));
}