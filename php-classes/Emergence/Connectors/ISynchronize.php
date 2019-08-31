<?php

namespace Emergence\Connectors;

interface ISynchronize
{
    public static function synchronize(IJob $Job, $pretend = true);
}
