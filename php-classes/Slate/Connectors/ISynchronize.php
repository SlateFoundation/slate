<?php

namespace Slate\Connectors;

interface ISynchronize
{
    public static function synchronize(Job $Job, $pretend = true, $verbose = false);
}