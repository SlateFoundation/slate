<?php

namespace Emergence\Database;

interface SqlConnectionInterface
{
    public static function createInstance($pdo);
    public static function hasDefaultInstance();
    public static function getDefaultInstance();
    public static function setDefaultInstance($instance);
}