<?php

namespace Emergence\TestsRW\ContactPoint;

require_once('emergence.read-write/ContactPoint/AbstractTest.php');

use \DB;
use \Person;
use \User;
use \RecordValidationException;
use \Emergence\People\ContactPoint\AbstractPoint;
use \Emergence\People\ContactPoint\Email;

class EmailTest extends AbstractTest
{
    protected static $testValue = 'test.case+123@example.com';
    protected static $targetClassName = '\\Emergence\\People\\ContactPoint\\Email';

    public function testAutoPrimary()
    {
        $this->doTestAutoPrimary(static::$testValue, 'testcase2@example.com');
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

    public function testDuplicateOnCreate()
    {
        $EmailPoint1 = Email::fromString(static::$testValue, static::$Person, true);
        $this->assertEquals($EmailPoint1, static::$testValue, 'New email point can be cast to string and match input value');
        $this->assertFalse($EmailPoint1->isPhantom, 'New email point is persisted to database');

        try {
            $EmailPoint2 = Email::fromString(static::$testValue, static::$Person, true);
        } catch (RecordValidationException $e) {
            $this->assertArrayHasKey('Data', $e->validationErrors, 'Validation errors contain Data key');
            $this->assertEquals($e->validationErrors['Data'], 'Cannot create an email contact point that matches an existing email contact point', 'Validation errors contain duplicate value error under Data key');

            $EmailPoint1->destroy();
            return;
        }

        $this->fail('An expected RecordValidationException has not been raised.');
    }

    public function testDuplicateOnUpdate()
    {
        $EmailPoint1 = Email::fromString(static::$testValue, static::$Person, true);
        $this->assertEquals($EmailPoint1, static::$testValue, 'First email point can be cast to string and match input value');
        $this->assertFalse($EmailPoint1->isPhantom, 'First email point is persisted to database');

        $altValue = 'alt.'.static::$testValue;
        $EmailPoint2 = Email::fromString($altValue, static::$Person, true);
        $this->assertEquals($EmailPoint2, $altValue, 'Second email point can be cast to string and match alt input value');
        $this->assertFalse($EmailPoint2->isPhantom, 'Second email point is persisted to database');

        $EmailPoint2->loadString(static::$testValue);
        $this->assertEquals($EmailPoint2, static::$testValue, 'Second email point can be cast to string and match original input value');

        try {
            $EmailPoint2->save();
        } catch (RecordValidationException $e) {
            $this->assertArrayHasKey('Data', $e->validationErrors, 'Validation errors contain Data key');
            $this->assertEquals($e->validationErrors['Data'], 'Cannot create an email contact point that matches an existing email contact point', 'Validation errors contain duplicate value error under Data key');

            $EmailPoint1->destroy();
            $EmailPoint2->destroy();
            return;
        }

        $this->fail('An expected RecordValidationException has not been raised.');
    }

    public function testGetUserByEmail()
    {
        $username = 'test-username';
        $password = 'test-password';

        static::$extraPeople[] = $User = User::create(array_merge(static::$personTestData, [
            'Username' => $username
        ]));
        $User->setClearPassword($password);
        $User->save();

        $this->assertFalse($User->isPhantom, 'User is persisted to database');
        $this->assertTrue($User->verifyPassword($password), 'User->verifyPassword returns true');

        $UserByUsername = User::getByUsername($username);
        $this->assertNotEmpty($UserByUsername, 'User was found by username');
        $this->assertEquals($User->ID, $UserByUsername->ID, 'User found by username matches created user ID');

        $UserByLogin = User::getByLogin($username, $password);
        $this->assertNotEmpty($UserByLogin, 'User was found by login');
        $this->assertEquals($User->ID, $UserByLogin->ID, 'User found by login matches created user ID');

        $User->destroy();
    }
}