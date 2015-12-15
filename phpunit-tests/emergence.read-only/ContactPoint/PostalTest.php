<?php

namespace Emergence\TestsRO\ContactPoint;

use \Emergence\People\ContactPoint\Postal;

class PostalTest extends \PHPUnit_Framework_TestCase
{
    protected static $addresses = [
        '908 N. 3rd St, Philadelphia, PA 19123' => [
            'serialized' => "{\"name\":null,\"number\":\"908\",\"street\":\"N. 3rd St\",\"unit\":null,\"city\":\"Philadelphia\",\"state\":\"PA\",\"postal\":\"19123\"}",
            'string' => "908 N. 3rd St\nPhiladelphia, PA 19123",
            'html' => "<a class=\"contact-link contact-postal\" data-address-name=\"\" data-address-number=\"908\" data-address-street=\"N. 3rd St\" data-address-unit=\"\" data-address-city=\"Philadelphia\" data-address-state=\"PA\" data-address-postal=\"19123\">908 N. 3rd St<br />\nPhiladelphia, PA 19123</a>"
        ],
        '908 N. 3rd St, Unit A, Philadelphia, PA 19123' => [
            'serialized' => "{\"name\":null,\"number\":\"908\",\"street\":\"N. 3rd St\",\"unit\":\"Unit A\",\"city\":\"Philadelphia\",\"state\":\"PA\",\"postal\":\"19123\"}",
            'string' => "908 N. 3rd St\nUnit A\nPhiladelphia, PA 19123",
            'html' => "<a class=\"contact-link contact-postal\" data-address-name=\"\" data-address-number=\"908\" data-address-street=\"N. 3rd St\" data-address-unit=\"Unit A\" data-address-city=\"Philadelphia\" data-address-state=\"PA\" data-address-postal=\"19123\">908 N. 3rd St<br />\nUnit A<br />\nPhiladelphia, PA 19123</a>"
        ],
        '908 N. 3rd St, 19123' => [
            'serialized' => "{\"name\":null,\"number\":\"908\",\"street\":\"N. 3rd St\",\"unit\":null,\"city\":null,\"state\":null,\"postal\":\"19123\"}",
            'string' => "908 N. 3rd St\n19123",
            'html' => "<a class=\"contact-link contact-postal\" data-address-name=\"\" data-address-number=\"908\" data-address-street=\"N. 3rd St\" data-address-unit=\"\" data-address-city=\"\" data-address-state=\"\" data-address-postal=\"19123\">908 N. 3rd St<br />\n19123</a>"
        ],
        '908 N. 3rd St, Unit A, 19123' => [
            'serialized' => "{\"name\":null,\"number\":\"908\",\"street\":\"N. 3rd St\",\"unit\":\"Unit A\",\"city\":null,\"state\":null,\"postal\":\"19123\"}",
            'string' => "908 N. 3rd St\nUnit A\n19123",
            'html' => "<a class=\"contact-link contact-postal\" data-address-name=\"\" data-address-number=\"908\" data-address-street=\"N. 3rd St\" data-address-unit=\"Unit A\" data-address-city=\"\" data-address-state=\"\" data-address-postal=\"19123\">908 N. 3rd St<br />\nUnit A<br />\n19123</a>"
        ],
        '908 N. 3rd St, PA 19123' => [
            'serialized' => "{\"name\":null,\"number\":\"908\",\"street\":\"N. 3rd St\",\"unit\":null,\"city\":null,\"state\":\"PA\",\"postal\":\"19123\"}",
            'string' => "908 N. 3rd St\nPA 19123",
            'html' => "<a class=\"contact-link contact-postal\" data-address-name=\"\" data-address-number=\"908\" data-address-street=\"N. 3rd St\" data-address-unit=\"\" data-address-city=\"\" data-address-state=\"PA\" data-address-postal=\"19123\">908 N. 3rd St<br />\nPA 19123</a>"
        ],
        '908 N. 3rd St, Unit A, PA 19123' => [
            'serialized' => "{\"name\":null,\"number\":\"908\",\"street\":\"N. 3rd St\",\"unit\":\"Unit A\",\"city\":null,\"state\":\"PA\",\"postal\":\"19123\"}",
            'string' => "908 N. 3rd St\nUnit A\nPA 19123",
            'html' => "<a class=\"contact-link contact-postal\" data-address-name=\"\" data-address-number=\"908\" data-address-street=\"N. 3rd St\" data-address-unit=\"Unit A\" data-address-city=\"\" data-address-state=\"PA\" data-address-postal=\"19123\">908 N. 3rd St<br />\nUnit A<br />\nPA 19123</a>"
        ],
        '908 N. 3rd St, Philadelphia, PA' => [
            'serialized' => "{\"name\":null,\"number\":\"908\",\"street\":\"N. 3rd St\",\"unit\":null,\"city\":\"Philadelphia\",\"state\":\"PA\",\"postal\":null}",
            'string' => "908 N. 3rd St\nPhiladelphia, PA",
            'html' => "<a class=\"contact-link contact-postal\" data-address-name=\"\" data-address-number=\"908\" data-address-street=\"N. 3rd St\" data-address-unit=\"\" data-address-city=\"Philadelphia\" data-address-state=\"PA\" data-address-postal=\"\">908 N. 3rd St<br />\nPhiladelphia, PA</a>"
        ],
        '908 N. 3rd St, Unit A, Philadelphia, PA' => [
            'serialized' => "{\"name\":null,\"number\":\"908\",\"street\":\"N. 3rd St\",\"unit\":\"Unit A\",\"city\":\"Philadelphia\",\"state\":\"PA\",\"postal\":null}",
            'string' => "908 N. 3rd St\nUnit A\nPhiladelphia, PA",
            'html' => "<a class=\"contact-link contact-postal\" data-address-name=\"\" data-address-number=\"908\" data-address-street=\"N. 3rd St\" data-address-unit=\"Unit A\" data-address-city=\"Philadelphia\" data-address-state=\"PA\" data-address-postal=\"\">908 N. 3rd St<br />\nUnit A<br />\nPhiladelphia, PA</a>"
        ],
        'Jarvus Innovations, 908 N. 3rd St, Philadelphia, PA 19123' => [
            'serialized' => "{\"name\":\"Jarvus Innovations\",\"number\":\"908\",\"street\":\"N. 3rd St\",\"unit\":null,\"city\":\"Philadelphia\",\"state\":\"PA\",\"postal\":\"19123\"}",
            'string' => "Jarvus Innovations\n908 N. 3rd St\nPhiladelphia, PA 19123",
            'html' => "<a class=\"contact-link contact-postal\" data-address-name=\"Jarvus Innovations\" data-address-number=\"908\" data-address-street=\"N. 3rd St\" data-address-unit=\"\" data-address-city=\"Philadelphia\" data-address-state=\"PA\" data-address-postal=\"19123\">Jarvus Innovations<br />\n908 N. 3rd St<br />\nPhiladelphia, PA 19123</a>"
        ],
        'Jarvus Innovations, 908 N. 3rd St, Unit A, Philadelphia, PA 19123' => [
            'serialized' => "{\"name\":\"Jarvus Innovations\",\"number\":\"908\",\"street\":\"N. 3rd St\",\"unit\":\"Unit A\",\"city\":\"Philadelphia\",\"state\":\"PA\",\"postal\":\"19123\"}",
            'string' => "Jarvus Innovations\n908 N. 3rd St\nUnit A\nPhiladelphia, PA 19123",
            'html' => "<a class=\"contact-link contact-postal\" data-address-name=\"Jarvus Innovations\" data-address-number=\"908\" data-address-street=\"N. 3rd St\" data-address-unit=\"Unit A\" data-address-city=\"Philadelphia\" data-address-state=\"PA\" data-address-postal=\"19123\">Jarvus Innovations<br />\n908 N. 3rd St<br />\nUnit A<br />\nPhiladelphia, PA 19123</a>"
        ],
        ' 908 N. 3rd St, Complex A, Philadelphia, PA 19123' => [
            'serialized' => "{\"name\":null,\"number\":\"908\",\"street\":\"N. 3rd St\",\"unit\":\"Complex A\",\"city\":\"Philadelphia\",\"state\":\"PA\",\"postal\":\"19123\"}",
            'string' => "908 N. 3rd St\nComplex A\nPhiladelphia, PA 19123",
            'html' => "<a class=\"contact-link contact-postal\" data-address-name=\"\" data-address-number=\"908\" data-address-street=\"N. 3rd St\" data-address-unit=\"Complex A\" data-address-city=\"Philadelphia\" data-address-state=\"PA\" data-address-postal=\"19123\">908 N. 3rd St<br />\nComplex A<br />\nPhiladelphia, PA 19123</a>"
        ],
        'Jarvus Innovations, 908 N. 3rd St, Complex A, Philadelphia, PA 19123' => [
            'serialized' => "{\"name\":\"Jarvus Innovations\",\"number\":\"908\",\"street\":\"N. 3rd St\",\"unit\":\"Complex A\",\"city\":\"Philadelphia\",\"state\":\"PA\",\"postal\":\"19123\"}",
            'string' => "Jarvus Innovations\n908 N. 3rd St\nComplex A\nPhiladelphia, PA 19123",
            'html' => "<a class=\"contact-link contact-postal\" data-address-name=\"Jarvus Innovations\" data-address-number=\"908\" data-address-street=\"N. 3rd St\" data-address-unit=\"Complex A\" data-address-city=\"Philadelphia\" data-address-state=\"PA\" data-address-postal=\"19123\">Jarvus Innovations<br />\n908 N. 3rd St<br />\nComplex A<br />\nPhiladelphia, PA 19123</a>"
        ],
        '448 Brown St, Apt. 2R, 19123' => [
            'serialized' => "{\"name\":null,\"number\":\"448\",\"street\":\"Brown St\",\"unit\":\"Apt. 2R\",\"city\":null,\"state\":null,\"postal\":\"19123\"}",
            'string' => "448 Brown St\nApt. 2R\n19123",
            'html' => "<a class=\"contact-link contact-postal\" data-address-name=\"\" data-address-number=\"448\" data-address-street=\"Brown St\" data-address-unit=\"Apt. 2R\" data-address-city=\"\" data-address-state=\"\" data-address-postal=\"19123\">448 Brown St<br />\nApt. 2R<br />\n19123</a>"
        ]
    ];

    public function testSerialize()
    {
        foreach (static::$addresses AS $address => $data) {
            $Address1 = Postal::fromString($address);
            $Address2 = Postal::fromSerialized($Address1->serialize());
            $this->assertEquals($Address1->toString(), $Address2->toString());
            $this->assertEquals($Address1->serialize(), $data['serialized']);
        }
    }

    public function testToString()
    {
        foreach (static::$addresses AS $address => $data) {
            $Address = Postal::fromString($address);
            $this->assertEquals($Address->toString(), $data['string']);
        }
    }

    public function testToHTML()
    {
        foreach (static::$addresses AS $address => $data) {
            $Address = Postal::fromString($address);
            $this->assertEquals($Address->toHTML(), $data['html']);
        }
    }

    /**
     * @expectedException \Emergence\Exceptions\ValidationException
     * @expectedExceptionMessage Could not parse sufficient address data from string
     */
    public function testUnparseable()
    {
        Postal::fromString("123 Street Rd");
    }
}