<?php

namespace Emergence\TestsRO\ContactPoint;

use \Emergence\People\ContactPoint\Phone;

class PhoneTest extends \PHPUnit_Framework_TestCase
{
    protected static $phoneNumbers = [
        '1234567890' => [
            'serialized' => '1234567890',
            'string' => '(123) 456-7890',
            'html' => '<a class="contact-link contact-phone" href="tel:+11234567890">(123) 456-7890</a>'
        ],
        '5555555555' => [
            'serialized' => '5555555555',
            'string' => '(555) 555-5555',
            'html' => '<a class="contact-link contact-phone" href="tel:+15555555555">(555) 555-5555</a>'
        ],
        '+15555555555' => [
            'serialized' => '5555555555',
            'string' => '(555) 555-5555',
            'html' => '<a class="contact-link contact-phone" href="tel:+15555555555">(555) 555-5555</a>'
        ],
        '+1 (555) 555.5555' => [
            'serialized' => '5555555555',
            'string' => '(555) 555-5555',
            'html' => '<a class="contact-link contact-phone" href="tel:+15555555555">(555) 555-5555</a>'
        ],
        '555.555.5555' => [
            'serialized' => '5555555555',
            'string' => '(555) 555-5555',
            'html' => '<a class="contact-link contact-phone" href="tel:+15555555555">(555) 555-5555</a>'
        ],
        '555-555.5555' => [
            'serialized' => '5555555555',
            'string' => '(555) 555-5555',
            'html' => '<a class="contact-link contact-phone" href="tel:+15555555555">(555) 555-5555</a>'
        ],
        '555.555-5555' => [
            'serialized' => '5555555555',
            'string' => '(555) 555-5555',
            'html' => '<a class="contact-link contact-phone" href="tel:+15555555555">(555) 555-5555</a>'
        ],
        '(555)555.5555' => [
            'serialized' => '5555555555',
            'string' => '(555) 555-5555',
            'html' => '<a class="contact-link contact-phone" href="tel:+15555555555">(555) 555-5555</a>'
        ],
        '1-555-555-5555' => [
            'serialized' => '5555555555',
            'string' => '(555) 555-5555',
            'html' => '<a class="contact-link contact-phone" href="tel:+15555555555">(555) 555-5555</a>'
        ],
        '15555555555' => [
            'serialized' => '5555555555',
            'string' => '(555) 555-5555',
            'html' => '<a class="contact-link contact-phone" href="tel:+15555555555">(555) 555-5555</a>'
        ]
    ];

    public function testSerialize()
    {
        foreach (static::$phoneNumbers AS $phoneNumber => $data) {
            $Phone1 = Phone::fromString($phoneNumber);
            $Phone2 = Phone::fromSerialized($Phone1->serialize());
            $this->assertEquals($Phone1->toString(), $Phone2->toString());
            $this->assertEquals($Phone1->serialize(), $data['serialized']);
        }
    }

    public function testToString()
    {
        foreach (static::$phoneNumbers AS $phoneNumber => $data) {
            $Phone = Phone::fromString($phoneNumber);
            $this->assertEquals($Phone->toString(), $data['string']);
        }
    }

    public function testToHTML()
    {
        foreach (static::$phoneNumbers AS $phoneNumber => $data) {
            $Phone = Phone::fromString($phoneNumber);
            $this->assertEquals($Phone->toHTML(), $data['html']);
        }
    }

    /**
     * @expectedException \Emergence\Exceptions\ValidationException
     * @expectedExceptionMessage Could not parse valid phone number
     */
    public function testFictitiousLocal()
    {
        Phone::fromString("(555) 555-0155");
    }

    /**
     * @expectedException \Emergence\Exceptions\ValidationException
     * @expectedExceptionMessage Could not parse valid phone number
     */
    public function testFictitious800()
    {
        Phone::fromString("+1800 555-0199");
    }

    /**
     * @expectedException \Emergence\Exceptions\ValidationException
     * @expectedExceptionMessage Could not parse valid phone number
     */
    public function testFictitious888()
    {
        Phone::fromString("+1888 555-5555");
    }
}