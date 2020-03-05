<?php

namespace Emergence\Git;

interface HashableInterface
{
    public function __toString();

    public function getRepository();

    public function getHash();

    public function getObjectType();
}
