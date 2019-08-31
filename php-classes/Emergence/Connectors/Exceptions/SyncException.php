<?php

namespace Emergence\Connectors\Exceptions;

class SyncException extends \Exception
{
    protected $context;

    public function __construct($message, array $context = [])
    {
        $this->message = $message;
        $this->context = $context;

        return parent::__construct($message);
    }

    public function getInterpolatedMessage()
    {
        return \Emergence\Logger::interpolate($this->message, $this->context);
    }

    public function getContext($key = null)
    {
        if ($key && is_array($this->context)) {
            return $this->context[$key];
        }

        return $this->context;
    }
}