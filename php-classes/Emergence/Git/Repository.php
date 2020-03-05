<?php

namespace Emergence\Git;

class Repository extends \Gitonomy\Git\Repository
{
    public function run($command, $args = [])
    {
        $rawArgs = [];

        // format named arguments to git's conventions
        foreach ($args as $key => $arg) {
            if (!is_int($key)) {
                $arg = "--$key=$arg";
            }

            $rawArgs[] = $arg;
        }

        return parent::run($command, $rawArgs);
    }
}
