<?php

namespace Emergence\TestsRW\ContactPoint;

require_once('emergence.read-write/ContactPoint/AbstractTest.php');

class NetworkTest extends AbstractTest
{
    protected static $testValue = 'SlateFoundation on twitter.com';
    protected static $targetClassName = '\\Emergence\\People\\ContactPoint\\Network';

    public function testStringInAndOut()
    {
        $this->doTestStringInAndOut(static::$testValue);
    }
}