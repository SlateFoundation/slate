<?php

namespace Emergence\TestsRW\ContactPoint;

require_once('emergence.read-write/ContactPoint/AbstractTest.php');

class PostalTest extends AbstractTest
{
    protected static $testValue = "Jarvus Innovations\n908 N 3rd St\nSuite A\nPhiladelphia, PA 19123";
    protected static $targetClassName = '\\Emergence\\People\\ContactPoint\\Postal';

    public function testAutoPrimary()
    {
        $this->doTestAutoPrimary(static::$testValue, "123 Road St\nAnytown, PA 12345");
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