<?php

namespace Emergence\People\ContactPoint;

class Phone extends AbstractPoint
{
    public static $alwaysUseCountryCode = false;

    public static $personPrimaryField = 'PrimaryPhoneID';

    public static $defaultLabel = 'Phone';

    public static $sortWeight = 500;

    public static $templates = [
        'Mobile Phone' => [
            'class' => self::class
            ,'alternateLabels' => ['Work Phone', 'Home Phone']
            ,'placeholder' => '(555) 555-0155'
            ,'pattern' => '/^\\(?\d{3}\\)?[^a-zA-Z0-9]*\d{3}[^a-zA-Z0-9]*\d{4}*$/i'
        ]
    ];

    public $number;

    public function loadString($string)
    {
        $this->number = preg_replace('/\D/', '', (string) $string);

        if (strlen($this->number) === 11 && $this->number[0] == '1') {
            $this->number = substr($this->number, 1);
        }

        // update serialization
        $this->Data = $this->serialize();
    }

    public function toString()
    {
        if (strlen((string) $this->number) === 10) {
            $area = substr((string) $this->number, 0, 3);
            $prefix = substr((string) $this->number, 3, 3);
            $line = substr((string) $this->number, 6);

            $formatted = "($area) $prefix-$line";

            if (static::$alwaysUseCountryCode) {
                return "+1 $formatted";
            }

            return $formatted;
        }

        return $this->number;
    }

    public function toHTML()
    {
        $prefix = '';

        if (strlen((string) $this->number) === 10) {
            $prefix = '+1';
        }

        return sprintf(
            '<a class="contact-link contact-phone" href="tel:%s">%s</a>'
            ,$prefix.$this->number
            ,htmlspecialchars((string) $this->toString())
        );
    }

    public function serialize()
    {
        return $this->number;
    }

    public function unserialize($serialized)
    {
        $this->number = $serialized;
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        if ($errors = \Validators\PhoneNumber::isInvalid($this->number)) {
            $this->_validator->addError('number', 'Phone number invalid:'.reset($errors));
        }

        // save results
        return $this->finishValidation();
    }
}