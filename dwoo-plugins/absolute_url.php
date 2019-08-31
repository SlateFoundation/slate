<?php

function Dwoo_Plugin_absolute_url(Dwoo_Core $dwoo, $path)
{
    return Emergence\Util\Url::buildAbsolute($path);
}