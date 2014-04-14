<?php

namespace Validators;

interface IValidator
{
    static public function isInvalid($data, array $options = array());
}