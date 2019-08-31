<?php

namespace Emergence\Database;

interface ConnectionSingletonInterface
{
    public static function getConnection();
}
