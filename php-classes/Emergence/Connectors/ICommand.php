<?php

namespace Emergence\Connectors;

interface ICommand
{
    public function describe();

    public function buildRequest();
}
