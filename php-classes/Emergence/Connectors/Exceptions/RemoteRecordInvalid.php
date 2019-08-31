<?php

namespace Emergence\Connectors\Exceptions;

class RemoteRecordInvalid extends \Exception
{
    private $_messageKey;
    private $_row;
    private $_valueKey;

    public function __construct($messageKey, $message, $row, $valueKey = null)
    {
        $this->_messageKey = $messageKey;
        $this->_row = $row;
        $this->_valueKey = $valueKey;

        parent::__construct($message);
    }

    public function getMessageKey()
    {
        return $this->_messageKey;
    }

    public function getRow()
    {
        return $this->_row;
    }

    public function getValueKey()
    {
        return $this->_valueKey;
    }
}