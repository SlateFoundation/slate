<?php

namespace Slate\Integrations;

interface IRequestHandler
{
    public static function getTitle();
    public static function handleRequest();
    public static function synchronize(SynchronizationJob $Job, $pretend = true, $verbose = false);
}