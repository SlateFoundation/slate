<?php

namespace Emergence\People\ContactPoint;

class Postal extends AbstractPoint
{
    public static $personPrimaryField = 'PrimaryPostalID';

    public static $defaultLabel = 'Postal';

    public static $sortWeight = 100;

    public static $templates = [
        'Home Address' => [
            'class' => __CLASS__
            ,'alternateLabels' => ['Work Address']
            ,'placeholder' => '123 Street Rd, Unit 123, Exampletown, PA 12345'
        ]
    ];

    public $name;
    public $number;
    public $street;
    public $unit;
    public $city;
    public $state;
    public $postal;

    public function loadString($string)
    {
        $segments = preg_split('/\s*[,\r\n]+\s*/', trim($string));

        $this->name = null;
        $this->number = null;
        $this->street = null;
        $this->unit = null;
        $this->city = null;
        $this->state = null;
        $this->postal = null;

        // TODO: use an online API if available for address normalization
        foreach ($segments AS $segment) {
            if (!$this->number && preg_match('/^(\d+)\s+(.*)/', $segment, $matches)) {
                $this->number = $matches[1];
                $this->street = $matches[2];
            } elseif (preg_match('/^([a-zA-Z]{2})\s+(\d{5}(-\d{4})?)$/', $segment, $matches)) {
                $this->state = $matches[1];
                $this->postal = $matches[2];
            } elseif (preg_match('/^\d{5}(-\d{4})?$/', $segment)) {
                $this->postal = $segment;
            } elseif (preg_match('/^[a-zA-Z]{2}$/', $segment)) {
                $this->state = $segment;
            } elseif (!$this->unit && $this->street && preg_match('/^(apartment|apt\\.?|suite|ste\\.?|unit)\s+(.*)$/i', $segment)) {
                $this->unit = $segment;
            } elseif (!$this->city && $this->street) {
                $this->city = $segment;
            } elseif (!$this->unit && $this->city && !$this->state && !$this->postal) {
                $this->unit = $this->city;
                $this->city = $segment;
            } elseif (!$this->name) {
                $this->name = $segment;
            }
        }

#        if (!$this->number || !$this->street || !($this->postal || ($this->city && $this->state))) {
#            throw new \Emergence\Exceptions\ValidationException('Could not parse sufficient address data from string');
#        }

        // update serialization
        $this->Data = $this->serialize();
    }

    public function toString()
    {
        $string = "$this->number $this->street";

        if ($this->name) {
            $string = "$this->name\n$string";
        }

        if ($this->unit) {
            $string .= "\n$this->unit";
        }

        if ($this->city || $this->state || $this->postal) {
            $string .= "\n";

            if ($this->city) {
                $string .= $this->city;

                if ($this->state || $this->postal) {
                    $string .= ', ';
                }
            }

            if ($this->state) {
                $string .= $this->state;

                if ($this->postal) {
                    $string .= ' ';
                }
            }

            if ($this->postal) {
                $string .= $this->postal;
            }
        }

        return $string;
    }

    public function toHTML()
    {
        return sprintf(
            '<a class="contact-link contact-postal" data-address-name="%s" data-address-number="%s" data-address-street="%s" data-address-unit="%s" data-address-city="%s" data-address-state="%s" data-address-postal="%s">%s</a>'
            ,htmlspecialchars($this->name)
            ,htmlspecialchars($this->number)
            ,htmlspecialchars($this->street)
            ,htmlspecialchars($this->unit)
            ,htmlspecialchars($this->city)
            ,htmlspecialchars($this->state)
            ,htmlspecialchars($this->postal)
            ,nl2br(htmlspecialchars($this->toString()))
        );
    }

    public function serialize()
    {
        return json_encode([
            'name' => $this->name
            ,'number' => $this->number
            ,'street' => $this->street
            ,'unit' => $this->unit
            ,'city' => $this->city
            ,'state' => $this->state
            ,'postal' => $this->postal
        ]);
    }

    public function unserialize($serialized)
    {
        $data = json_decode($serialized, true);

        if (!is_array($data)) {
            throw new \Exception('Invalid postal address serialization, unable to decode JSON');
        }

        $this->name = !empty($data['name']) ? $data['name'] : null;
        $this->number = !empty($data['number']) ? $data['number'] : null;
        $this->street = !empty($data['street']) ? $data['street'] : null;
        $this->unit = !empty($data['unit']) ? $data['unit'] : null;
        $this->city = !empty($data['city']) ? $data['city'] : null;
        $this->state = !empty($data['state']) ? $data['state'] : null;
        $this->postal = !empty($data['postal']) ? $data['postal'] : null;
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        if (!$this->number) {
            $this->_validator->addError('number', 'Street number is required');
        }

        if (!$this->street) {
            $this->_validator->addError('street', 'Street name is required');
        }

        if (!($this->postal || ($this->city && $this->state))) {
            $this->_validator->addError('postal', 'Postal code or city+state is required');
        }

        // save results
        return $this->finishValidation();
    }
}