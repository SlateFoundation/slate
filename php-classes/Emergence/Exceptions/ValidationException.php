<?php

namespace Emergence\Exceptions;

class ValidationException extends \Exception
{
    protected $_errors;

    public function __construct($message = null, $errors = [], $code = 0, Exception $previous = null)
    {
        if (!count($errors)) {
            $errors['invalid'] = $message ? $message : 'Value is invalid';
        }

        $this->_errors = $errors;

        parent::__construct($message, $code, $previous);
    }

    public function getValidationErrors()
    {
        return $this->_errors;
    }
}