<?php

namespace Emergence\People\ContactPoint;

class Email extends AbstractPoint
{
    public static $personPrimaryField = 'PrimaryEmailID';

    public static $defaultLabel = 'Email';

    public static $sortWeight = 1000;

    public static $templates = array(
        'School Email' => array(
            'class' => __CLASS__
            ,'placeholder' => ''
        )
        ,'Work Email' => array(
            'class' => __CLASS__
            ,'alternateLabels' => array('Personal Email')
            ,'placeholder' => 'username@example.com'
        )
    );

    public $address;

    static function __classLoaded()
    {
        static::$templates['School Email']['placeholder'] = 'username@'.\Site::getConfig('primary_hostname');
        return parent::__classLoaded();
    }

    public function loadString($string)
    {
        $this->address = (string)$string;
    }

    public function toString()
    {
        return $this->address;
    }

    public function toHTML()
    {
        return sprintf(
            '<a class="contact-link contact-email" href="mailto:%s">%s</a>'
            ,urlencode($this->address)
            ,htmlspecialchars($this->toString())
        );
    }

    public function serialize()
    {
        return $this->address;
    }

    public function unserialize($serialized)
    {
        $this->address = $serialized;
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        // check
        if ($errors = \Validators\EmailAddress::isInvalid($this->address)) {
            $this->_validator->addError('address', 'Email address invalid:'.reset($errors));
        }

        // check for duplicate
        if ($this->isFieldDirty('Data')) {
            $conditions = array();

            if (!$this->isPhantom) {
                $conditions[] = "ID != $this->ID";
            }

            if (static::getByString($this, $conditions)) {
                $this->_validator->addError('address', 'Cannot create an email contact point that matches an existing email contact point');
            }
        }

        // save results
        return $this->finishValidation();
    }
}