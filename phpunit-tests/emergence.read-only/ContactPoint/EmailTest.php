<?php

namespace Emergence\TestsRO\ContactPoint;

use \Emergence\People\ContactPoint\Email;

class EmailTest extends \PHPUnit_Framework_TestCase
{
    protected static $emailAddresses = [
        'username@example.com' => [
            'serialized' => 'username@example.com',
            'string' => 'username@example.com',
            'html' => '<a class="contact-link contact-email" href="mailto:username%40example.com">username@example.com</a>'
        ],
        'username+suffix@example.com' => [
            'serialized' => 'username+suffix@example.com',
            'string' => 'username+suffix@example.com',
            'html' => '<a class="contact-link contact-email" href="mailto:username%2Bsuffix%40example.com">username+suffix@example.com</a>'
        ]
    ];

    public function testSerialize()
    {
        foreach (static::$emailAddresses AS $emailAddress => $data) {
            $Email1 = Email::fromString($emailAddress);
            $Email2 = Email::fromSerialized($Email1->serialize());
            $this->assertEquals($Email1->toString(), $Email2->toString());
            $this->assertEquals($Email1->serialize(), $data['serialized']);
        }
    }

    public function testToString()
    {
        foreach (static::$emailAddresses AS $emailAddress => $data) {
            $Email = Email::fromString($emailAddress);
            $this->assertEquals($Email->toString(), $data['string']);
        }
    }

    public function testToHTML()
    {
        foreach (static::$emailAddresses AS $emailAddress => $data) {
            $Email = Email::fromString($emailAddress);
            $this->assertEquals($Email->toHTML(), $data['html']);
        }
    }

    /**
     * @expectedException \Emergence\Exceptions\ValidationException
     * @expectedExceptionMessage Could not parse valid email address
     */
    public function testUnparseable()
    {
        Email::fromString("foobar");
    }

    /**
     * @expectedException \Emergence\Exceptions\ValidationException
     * @expectedExceptionMessage Could not parse valid email address
     */
    public function testBlacklist()
    {
        Email::fromString("user@mailinator.com");
    }
}