<?php

namespace Emergence\TestsRW\ContactPoint;

require_once('emergence.read-write/ContactPoint/AbstractTest.php');

class PhoneTest extends AbstractTest
{
    protected static $testValue = '(123) 555-1955';
    protected static $targetClassName = '\\Emergence\\People\\ContactPoint\\Phone';

    public function testAutoPrimary()
    {
        $this->doTestAutoPrimary(static::$testValue, '+1 (800) 555-5555');
    }

    public function testStringInAndOut()
    {
        $this->doTestStringInAndOut(static::$testValue);
    }

    public function testDirtyPersonNotSaved()
    {
        $this->doTestDirtyPersonNotSaved(static::$testValue);
    }

    public function testReciprocalRelationshipParallel()
    {
        $this->doTestReciprocalRelationshipParallel(static::$testValue);
    }

    public function testReciprocalRelationshipSeries()
    {
        $this->doTestReciprocalRelationshipSeries(static::$testValue);
    }

    public function testThieving()
    {
        $this->doTestThieving(static::$testValue);
    }
}