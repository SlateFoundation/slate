<?php

namespace Emergence\TestsRO\ContactPoint;

use \Emergence\People\ContactPoint\Link;

class LinkTest extends \PHPUnit_Framework_TestCase
{
    protected static $links = [
        'http://example.com/?key1=value1&key2=value2' => [
            'serialized' => 'http://example.com/?key1=value1&key2=value2',
            'string' => 'http://example.com/?key1=value1&key2=value2',
            'html' => '<a class="contact-link contact-url" href="http://example.com/?key1=value1&amp;key2=value2">http://example.com/?key1=value1&amp;key2=value2</a>'
        ],
        'https://username:password@www.example.com/path/to/resource?key1=value1&key2=value2' => [
            'serialized' => 'https://username:password@www.example.com/path/to/resource?key1=value1&key2=value2',
            'string' => 'https://username:password@www.example.com/path/to/resource?key1=value1&key2=value2',
            'html' => '<a class="contact-link contact-url" href="https://username:password@www.example.com/path/to/resource?key1=value1&amp;key2=value2">https://username:password@www.example.com/path/to/resource?key1=value1&amp;key2=value2</a>'
        ]
    ];

    public function testSerialize()
    {
        foreach (static::$links AS $link => $data) {
            $Link1 = Link::fromString($link);
            $Link2 = Link::fromSerialized($Link1->serialize());
            $this->assertEquals($Link1->toString(), $Link2->toString());
            $this->assertEquals($Link1->serialize(), $data['serialized']);
        }
    }

    public function testToString()
    {
        foreach (static::$links AS $link => $data) {
            $Link = Link::fromString($link);
            $this->assertEquals($Link->toString(), $data['string']);
        }
    }

    public function testToHTML()
    {
        foreach (static::$links AS $link => $data) {
            $Link = Link::fromString($link);
            $this->assertEquals($Link->toHTML(), $data['html']);
        }
    }

    /**
     * @expectedException \Emergence\Exceptions\ValidationException
     * @expectedExceptionMessage Could not parse valid URL
     */
    public function testUnparseable()
    {
        Link::fromString("http://");
    }

    /**
     * @expectedException \Emergence\Exceptions\ValidationException
     * @expectedExceptionMessage Could not parse valid URL
     */
    public function testInvalidScheme()
    {
        Link::fromString("telnet://example.com");
    }
}