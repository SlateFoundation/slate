<?php

namespace Validators;

interface IValidator
{
    public static function isInvalid($data, array $options = []);
}