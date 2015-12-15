<?php

namespace Emergence\TestsRO\ContactPoint;

use \Emergence\People\ContactPoint\Network;

class NetworkTest extends \PHPUnit_Framework_TestCase
{
    protected static $networkIds = [
        'twitter.com/username' => [
            'serialized' => 'twitter.com/username',
            'string' => 'username on twitter.com',
            'html' => '<a class="contact-link contact-network contact-network-composite network-twitter_com" href="http://twitter.com/username">username on twitter.com</a>'
        ],
        'example.com/username' => [
            'serialized' => 'example.com/username',
            'string' => 'username on example.com',
            'html' => '<span class="contact-network-fuzzy network-example_com">username on <a class="contact-link contact-network contact-network-networkonly network-example_com" href="http://example.com">example.com</a></span>'
        ]
    ];

    public function testSerialize()
    {
        foreach (static::$networkIds AS $networkId => $data) {
            $Network1 = Network::fromString($networkId);
            $Network2 = Network::fromSerialized($Network1->serialize());
            $this->assertEquals($Network1->toString(), $Network2->toString());
            $this->assertEquals($Network1->serialize(), $data['serialized']);
        }
    }

    public function testToString()
    {
        foreach (static::$networkIds AS $networkId => $data) {
            $Network = Network::fromString($networkId);
            $this->assertEquals($Network->toString(), $data['string']);
        }
    }

    public function testToHTML()
    {
        foreach (static::$networkIds AS $networkId => $data) {
            $Network = Network::fromString($networkId);
            $this->assertEquals($Network->toHTML(), $data['html']);
        }
    }

    /**
     * @expectedException \Emergence\Exceptions\ValidationException
     * @expectedExceptionMessage Network string must be in the format "hostname/username" or "username on hostname"
     */
    public function testUnparseable()
    {
        Network::fromString("foobar");
    }

    /**
     * @expectedException \Emergence\Exceptions\ValidationException
     * @expectedExceptionMessage Network must be identified by a fully-qualified domain name
     */
    public function testInvalidHostname()
    {
        Network::fromString("foobar/username");
    }
}