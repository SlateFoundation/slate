<?php

namespace Emergence\TestsRW\ContactPoint;

use \DB;
use \Person;
use \RecordValidationException;
use \Emergence\People\ContactPoint\AbstractPoint;

abstract class AbstractTest extends \PHPUnit_Framework_TestCase
{
    protected static $targetClassName;

    protected static $Person;
    protected static $personTestData = [
        'FirstName' => 'TestCaseFirstName',
        'LastName' => 'TestCaseLastName'
    ];

    protected static $extraPeople = [];

    public static function setUpBeforeClass()
    {
        static::$Person = Person::create(static::$personTestData, true);
    }

    protected function tearDown()
    {
        $deletedPoints = 0;
        $deletedExtraPeople = 0;

        DB::nonQuery('DELETE FROM `%s` WHERE PersonID = %u', [
            AbstractPoint::$tableName
            ,static::$Person->ID
        ]);

        $deletedPoints += DB::affectedRows();


        while ($extraPerson = array_shift(static::$extraPeople)) {
            if ($extraPerson->isPhantom) {
                continue;
            }

            if (!$extraPerson->isDestroyed) {
                $extraPerson->destroy();
                $deletedExtraPeople++;
            }

            DB::nonQuery('DELETE FROM `%s` WHERE PersonID = %u', [
                AbstractPoint::$tableName
                ,$extraPerson->ID
            ]);

            $deletedPoints += DB::affectedRows();
        }

        $this->assertEquals($deletedPoints, 0, 'No contact points for test people were left in database table after test');
        $this->assertEquals($deletedExtraPeople, 0, 'No extra test people were left in database table after test');
    }

    public static function tearDownAfterClass()
    {
        static::$Person->destroy();
    }

    protected function doTestAutoPrimary($value1, $value2)
    {
        $className = static::$targetClassName;
        $this->assertNotEmpty($className, 'PointTest::$targetClassName is configured');

        $primaryField = $className::$personPrimaryField;
        $this->assertNotEmpty($primaryField, 'Target class has no $personPrimaryField configured');
        $this->assertStringEndsWith('ID', $primaryField, 'Target class $primaryField ends with "ID"');
        $this->assertTrue(Person::fieldExists($primaryField), 'Person class has field defined matching target class $primaryField');

        $primaryRelationship = substr($primaryField, 0, -2);
        $this->assertTrue(Person::relationshipExists($primaryRelationship), 'Person class has relationship defined matching target class $personPrimaryField');

        $this->assertNull(static::$Person->$primaryField, 'Primary field is null initially');

        $Point1 = $className::fromString($value1, static::$Person);
        $Point2 = $className::fromString($value2, static::$Person);
        $this->assertNull(static::$Person->$primaryField, 'Primary field is still null after creating phantom contact points');
        $this->assertFalse(static::$Person->isDirty, 'Person is not dirty before saving contact point');

        $Point1->save();
        $this->assertEquals(static::$Person->$primaryField, $Point1->ID, 'Primary field matches first contact point ID after saving first contact point');
        $this->assertInstanceOf($className, static::$Person->$primaryRelationship, 'Primary relationship is instance of target class');
        $this->assertEquals(static::$Person->$primaryRelationship->ID, $Point1->ID, 'Primary relationship ID matches first contact point ID after saving first contact point');
        $this->assertFalse(static::$Person->isDirty, 'Person is still not dirty after saving contact point');

        $Point2->save();
        $this->assertEquals(static::$Person->$primaryField, $Point1->ID, 'Primary field not changed after saving second contact point');
        $this->assertFalse(static::$Person->isDirty, 'Person is still not dirty after saving second contact point');

        $Point1->destroy();
        $this->assertEquals(static::$Person->$primaryField, $Point2->ID, 'Primary field matches second contact point ID after destroying first contact point');
        $this->assertInstanceOf($className, static::$Person->$primaryRelationship, 'Primary relationship is instance of target class after destroying first contact point');
        $this->assertEquals(static::$Person->$primaryRelationship->ID, $Point2->ID, 'Primary relationship ID matches first contact point ID after destroying first contact point');
        $this->assertFalse(static::$Person->isDirty, 'Person is still not dirty after destroying first contact point');

        $Point2->destroy();
        $this->assertNull(static::$Person->$primaryField, 'Primary field is null after destroying second contact point');
        $this->assertFalse(static::$Person->isDirty, 'Person is still not dirty after destroying second contact point');
    }

    protected function doTestStringInAndOut($string)
    {
        $className = static::$targetClassName;
        $this->assertNotEmpty($className, 'PointTest::$targetClassName is configured');

        $this->assertNotEmpty($className::$defaultLabel, 'Target class has a default label');

        $SavedPoint = $className::fromString($string, static::$Person, true);
        $this->assertEquals($string, (string)$SavedPoint, 'Saved point instance cast to string matches input string');

        $RetrievedPoint = $className::getByString($string);
        $this->assertEquals($RetrievedPoint->ID, $SavedPoint->ID, 'Saved point ID matched retrieved point ID');
        $this->assertEquals($string, (string)$RetrievedPoint, 'Saved point instance cast to string matches input string');
        $this->assertEquals($RetrievedPoint->Label, $className::$defaultLabel, 'Retriedev point label matches default label for target class');

        $RetrievedPoint->destroy();

        // re-fetch person because we modified a different instance via $RetrievedPoint->Person
        static::$Person = Person::getByID(static::$Person->ID);
    }

    protected function doTestDirtyPersonNotSaved($value)
    {
        $className = static::$targetClassName;
        $this->assertNotEmpty($className, 'PointTest::$targetClassName is configured');

        $primaryField = $className::$personPrimaryField;
        $this->assertNotEmpty($primaryField, 'Target class has no $personPrimaryField configured');

        $this->assertEquals(static::$Person->FirstName, static::$personTestData['FirstName'], 'Person->FirstName matches original value');
        $this->assertNull(static::$Person->$primaryField, 'Primary field is null initially');
        $this->assertFalse(static::$Person->isDirty, 'Person is not dirty initially');

        $newFirstName = static::$Person->FirstName = static::$personTestData['FirstName'].'Changed';
        $this->assertTrue(static::$Person->isDirty, 'Person is dirty after changing first name');

        $Point = $className::fromString($value, static::$Person, true);
        $this->assertEquals(static::$Person->$primaryField, $Point->ID, 'Primary field matches new contact point ID');
        $this->assertEquals(static::$Person->FirstName, $newFirstName, 'Person->FirstName still matches new value after saving contact point');
        $this->assertTrue(static::$Person->isDirty, 'Person is still dirty after saving contact point');

        $PersonRetrieved = Person::getByID(static::$Person->ID);
        $this->assertEquals($PersonRetrieved->FirstName, static::$personTestData['FirstName'], 'Person instance retrieved from database still has original value');
        $this->assertNull($PersonRetrieved->$primaryField, 'Person instance retrieved from database still has null primary field');

        $Point->destroy();
        $this->assertNull(static::$Person->$primaryField, 'Primary field is null after destroying contact point');
        $this->assertEquals(static::$Person->FirstName, $newFirstName, 'Person->FirstName still matches new value after destroying contact point');
        $this->assertTrue(static::$Person->isDirty, 'Person is still dirty after destroying contact point');

        static::$Person = $PersonRetrieved;
        $this->assertEquals(static::$Person->FirstName, static::$personTestData['FirstName'], 'Person instance retrieved from database still has original value after destroying contact point');
        $this->assertFalse(static::$Person->isDirty, 'Person instance retrieved from database is not dirty');
    }

    protected function doTestReciprocalRelationshipParallel($value)
    {
        $className = static::$targetClassName;
        $this->assertNotEmpty($className, 'PointTest::$targetClassName is configured');

        $primaryField = $className::$personPrimaryField;
        $this->assertNotEmpty($primaryField, 'Target class has no $personPrimaryField configured');

        $primaryRelationship = substr($primaryField, 0, -2);
        $this->assertTrue(Person::relationshipExists($primaryRelationship), 'Person class has relationship defined matching target class $personPrimaryField');

        $Person = Person::create(array_merge(static::$personTestData, [
            $primaryRelationship => $className::fromString($value)
        ]));
        static::$extraPeople[] = $Person; // register before any tests to ensure destruction if test fails
        $Person->save();

        $this->assertEquals($Person->$primaryField, $Person->$primaryRelationship->ID, 'New person\'s PrimaryPointID field matches relationship PrimaryPoint->ID');
        $this->assertEquals($Person->ID, $Person->$primaryRelationship->PersonID, 'New person\'s ID field matches relationship PrimaryPoint->PersonID in cache');
        $this->assertEquals($Person->ID, $className::getByID($Person->$primaryField)->PersonID, 'New person\'s ID field matches relationship PrimaryPoint->PersonID in DB');

        $Person->$primaryRelationship->destroy();
        $Person->destroy();
    }

    protected function doTestReciprocalRelationshipSeries($value)
    {
        $className = static::$targetClassName;
        $this->assertNotEmpty($className, 'PointTest::$targetClassName is configured');

        $primaryField = $className::$personPrimaryField;
        $this->assertNotEmpty($primaryField, 'Target class has no $personPrimaryField configured');

        $primaryRelationship = substr($primaryField, 0, -2);
        $this->assertTrue(Person::relationshipExists($primaryRelationship), 'Person class has relationship defined matching target class $personPrimaryField');

        $Person = Person::create(static::$personTestData, true);
        static::$extraPeople[] = $Person; // register before any tests to ensure destruction if test fails
        $Person->save();

        $this->assertNull($Person->$primaryField);

        $Person->$primaryRelationship = $className::fromString($value);
        $Person->save();

        $this->assertEquals($Person->$primaryField, $Person->$primaryRelationship->ID, 'New person\'s PrimaryPointID field matches relationship PrimaryPoint->ID');
        $this->assertEquals($Person->ID, $Person->$primaryRelationship->PersonID, 'New person\'s ID field matches relationship PrimaryPoint->PersonID in cache');
        $this->assertEquals($Person->ID, $className::getByID($Person->$primaryField)->PersonID, 'New person\'s ID field matches relationship PrimaryPoint->PersonID in DB');

        $Person->$primaryRelationship->destroy();
        $Person->destroy();
    }

    protected function doTestThieving($value)
    {
        $className = static::$targetClassName;
        $this->assertNotEmpty($className, 'PointTest::$targetClassName is configured');

        $primaryField = $className::$personPrimaryField;
        $this->assertNotEmpty($primaryField, 'Target class has no $personPrimaryField configured');

        $primaryRelationship = substr($primaryField, 0, -2);
        $this->assertTrue(Person::relationshipExists($primaryRelationship), 'Person class has relationship defined matching target class $personPrimaryField');

        $Point = $className::fromString($value, static::$Person, true);

        try {
            static::$extraPeople[] = Person::create(array_merge(static::$personTestData, [$primaryRelationship => $Point]), true);
        } catch (RecordValidationException $e) {
            $this->assertArrayHasKey($primaryField, $e->validationErrors, 'Validation errors contain PrimaryEmailID key');
            $this->assertEquals($e->validationErrors[$primaryField], $primaryRelationship.' already belongs to another person');
            $Point->destroy();
            return;
        }

        $this->fail('An expected RecordValidationException has not been raised.');
    }
}