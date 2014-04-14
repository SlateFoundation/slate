<?php

namespace Emergence\TestsRW\ContactPoint;

require_once('emergence.read-write/ContactPoint/AbstractTest.php');

class LinkTest extends AbstractTest
{
    static protected $testValue = 'http://slate.is/login?_LOGIN[username]=foobar';
    static protected $targetClassName = '\\Emergence\\People\\ContactPoint\\Link';
    
    public function testStringInAndOut()
    {
        $this->doTestStringInAndOut(static::$testValue);
    }
}