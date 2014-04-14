<?php

namespace Slate\Integrations;

interface IRequestHandler
{
    static public function getTitle();
    static public function handleRequest();
    static public function synchronize(SynchronizationJob $Job, $pretend = true, $verbose = false);
}