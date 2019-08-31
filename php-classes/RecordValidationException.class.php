<?php



 class RecordValidationException extends Exception
 {
     protected $_recordObject;

     public function __construct($recordObject, $message = null, $code = 0, Exception $previous = null)
     {
         $this->_recordObject = $recordObject;

         parent::__construct($message, $code, $previous);
     }

     public function __get($name)
     {
         switch ($name) {
            case 'recordObject':
                return $this->_recordObject;

            case 'validationErrors':
                return $this->_recordObject->validationErrors;

            default:
                return null;
        }
     }
 }