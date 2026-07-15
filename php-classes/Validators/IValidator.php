<?php

declare(strict_types=1);

namespace Validators;

interface IValidator
{
    public static function isInvalid($data, array $options = []);
}
