<?php

namespace Emergence\TestsRW\ContactPoint;

require_once('emergence.read-write/ContactPoint/AbstractTest.php');

class NetworkTest extends AbstractTest
{
    static protected $testValue = 'SlateFoundation on twitter.com';
    static protected $targetClassName = '\\Emergence\\People\\ContactPoint\\Network';
    
    public function testStringInAndOut()
    {
        $this->doTestStringInAndOut(static::$testValue);
    }
}