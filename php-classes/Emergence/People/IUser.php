<?php

namespace Emergence\People;

interface IUser
{
    public static function getByLogin($username, $password);
    public static function getByUsername($username);

    public function verifyPassword($password);
    public function setClearPassword($password);
    public function hasAccountLevel($accountLevel);
}