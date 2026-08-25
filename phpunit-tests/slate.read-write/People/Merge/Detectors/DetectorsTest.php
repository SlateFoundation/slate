<?php

namespace Slate\TestsRW\People\Merge\Detectors;

use DB;
use Emergence\People\ContactPoint\Email;
use Emergence\People\Person;
use Emergence\Connectors\Mapping;
use Slate\People\Merge\MergeAudit;
use Slate\People\Merge\Detectors\IdenticalNameDetector;
use Slate\People\Merge\Detectors\IdenticalStudentNumberDetector;
use Slate\People\Merge\Detectors\MappingAnomalyDetector;
use Slate\People\Merge\Detectors\SharedContactPointDetector;
use Slate\People\Student;

/**
 * Covers the first bullet of the Validation checklist in
 * plans/duplicate-candidates.md: each detector finds its planted fixture
 * pair and scores it. Also covers the tombstoned-exclusion rule shared by
 * every detector (a person already merged away as a completed merge's
 * source never resurfaces as a new candidate). Requires a live DB via the
 * full Emergence/Slate runtime; not runnable outside a composed site.
 */
class DetectorsTest extends \PHPUnit_Framework_TestCase
{
    /** @var Person[] */
    protected static $people = [];

    protected function tearDown(): void
    {
        if (count(static::$people) === 0) {
            return;
        }

        $ids = array_map(fn (Person $Person) => $Person->ID, static::$people);
        $idList = implode(',', $ids);

        DB::nonQuery('DELETE FROM `%s` WHERE PersonID IN (%s)', [\Emergence\People\ContactPoint\AbstractPoint::$tableName, $idList]);
        DB::nonQuery('DELETE FROM `%s` WHERE ContextClass = "%s" AND ContextID IN (%s)', [Mapping::$tableName, DB::escape(Person::getRootClass()), $idList]);
        DB::nonQuery('DELETE FROM `%s` WHERE SourcePersonID IN (%s) OR TargetPersonID IN (%s)', [MergeAudit::$tableName, $idList, $idList]);
        DB::nonQuery('DELETE FROM `%s` WHERE ID IN (%s)', [Person::$tableName, $idList]);

        static::$people = [];
    }

    protected function makePerson(array $fields, string $class = Person::class): Person
    {
        $Person = $class::create($fields, true);
        static::$people[] = $Person;

        return $Person;
    }

    protected function findMatch(array $matches, Person $A, Person $B): ?array
    {
        foreach ($matches as $match) {
            $ids = [$match['personAID'], $match['personBID']];
            sort($ids);
            $expected = [min($A->ID, $B->ID), max($A->ID, $B->ID)];

            if ($ids === $expected) {
                return $match;
            }
        }

        return null;
    }

    public function testIdenticalNameDetectorFindsPlantedPair()
    {
        $A = $this->makePerson(['FirstName' => ' Dupname ', 'LastName' => 'FixtureName']);
        $B = $this->makePerson(['FirstName' => 'dupname', 'LastName' => 'fixtureName']);

        $matches = (new IdenticalNameDetector())->detect();
        $match = $this->findMatch($matches, $A, $B);

        $this->assertNotNull($match, 'identical (trimmed, case-insensitive) name pair was not found');
        $this->assertGreaterThan(0, $match['score']);
        $this->assertEquals('FixtureName', $match['evidence']['lastName']);
    }

    public function testIdenticalNameDetectorExcludesATombstonedMergeSource()
    {
        $A = $this->makePerson(['FirstName' => 'TombstonedName', 'LastName' => 'FixtureName']);
        $B = $this->makePerson(['FirstName' => 'TombstonedName', 'LastName' => 'FixtureName']);

        MergeAudit::create(['SourcePersonID' => $A->ID, 'TargetPersonID' => $B->ID], true);

        $matches = (new IdenticalNameDetector())->detect();
        $this->assertNull($this->findMatch($matches, $A, $B), 'a pair with an already-tombstoned source should not resurface');
    }

    public function testSharedContactPointDetectorFindsPlantedPair()
    {
        $A = $this->makePerson(['FirstName' => 'ContactA', 'LastName' => 'FixtureContact']);
        $B = $this->makePerson(['FirstName' => 'ContactB', 'LastName' => 'FixtureContact']);

        $sharedEmail = 'shared-'.uniqid().'@example.com';
        Email::fromString($sharedEmail, $A, true);
        Email::fromString($sharedEmail, $B, true);

        $matches = (new SharedContactPointDetector())->detect();
        $match = $this->findMatch($matches, $A, $B);

        $this->assertNotNull($match, 'shared contact point pair was not found');
        $this->assertCount(1, $match['evidence']['sharedContactPoints']);
    }

    public function testSharedContactPointDetectorScoresMultipleSharedPointsHigher()
    {
        $A = $this->makePerson(['FirstName' => 'MultiA', 'LastName' => 'FixtureContact']);
        $B = $this->makePerson(['FirstName' => 'MultiB', 'LastName' => 'FixtureContact']);

        $sharedEmail = 'shared-'.uniqid().'@example.com';
        Email::fromString($sharedEmail, $A, true);
        Email::fromString($sharedEmail, $B, true);

        $singleMatchScore = $this->findMatch((new SharedContactPointDetector())->detect(), $A, $B)['score'];

        $sharedEmail2 = 'shared2-'.uniqid().'@example.com';
        Email::fromString($sharedEmail2, $A, true);
        Email::fromString($sharedEmail2, $B, true);

        $doubleMatch = $this->findMatch((new SharedContactPointDetector())->detect(), $A, $B);

        $this->assertCount(2, $doubleMatch['evidence']['sharedContactPoints']);
        $this->assertGreaterThan($singleMatchScore, $doubleMatch['score']);
    }

    public function testMappingAnomalyDetectorFindsDisabledMappedRecordAgainstRicherSameNameRecord()
    {
        $Mapped = $this->makePerson([
            'FirstName' => 'AnomalyName', 'LastName' => 'FixtureAnomaly',
            'Username' => 'anomaly-mapped-'.uniqid(), 'AccountLevel' => 'Disabled',
        ], Student::class);
        $Richer = $this->makePerson(['FirstName' => 'AnomalyName', 'LastName' => 'FixtureAnomaly']);
        Email::fromString('richer-'.uniqid().'@example.com', $Richer, true);

        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => $Mapped->ID,
            'Source' => 'manual', 'Connector' => 'detector-test-connector',
            'ExternalKey' => 'id', 'ExternalIdentifier' => 'mapped-external-id',
        ], true);

        $matches = (new MappingAnomalyDetector())->detect();
        $match = $this->findMatch($matches, $Mapped, $Richer);

        $this->assertNotNull($match, 'disabled mapped record vs. richer same-name record was not found');
        $this->assertEquals($Mapped->ID, $match['evidence']['mappedPersonID']);
        $this->assertEquals($Richer->ID, $match['evidence']['richerPersonID']);
    }

    public function testMappingAnomalyDetectorFindsEffectivelyEmptyMappedRecordAgainstRicherSameNameRecord()
    {
        // "effectively empty" (not disabled, but zero contact points) mapped
        // against a same-name record that has at least one
        $Mapped = $this->makePerson(['FirstName' => 'EmptyAnomaly', 'LastName' => 'FixtureAnomaly']);
        $Richer = $this->makePerson(['FirstName' => 'EmptyAnomaly', 'LastName' => 'FixtureAnomaly']);
        Email::fromString('richer2-'.uniqid().'@example.com', $Richer, true);

        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => $Mapped->ID,
            'Source' => 'manual', 'Connector' => 'detector-test-connector',
            'ExternalKey' => 'id', 'ExternalIdentifier' => 'empty-mapped-external-id',
        ], true);

        $matches = (new MappingAnomalyDetector())->detect();
        $this->assertNotNull($this->findMatch($matches, $Mapped, $Richer));
    }

    public function testMappingAnomalyDetectorIgnoresAMappedRecordThatIsAlreadyTheRicherOne()
    {
        $Richer = $this->makePerson(['FirstName' => 'NotAnomaly', 'LastName' => 'FixtureAnomaly']);
        $Poorer = $this->makePerson(['FirstName' => 'NotAnomaly', 'LastName' => 'FixtureAnomaly']);
        Email::fromString('notanomaly-'.uniqid().'@example.com', $Richer, true);

        // mapping points at the RICHER record -- not an anomaly
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => $Richer->ID,
            'Source' => 'manual', 'Connector' => 'detector-test-connector',
            'ExternalKey' => 'id', 'ExternalIdentifier' => 'not-anomaly-external-id',
        ], true);

        $matches = (new MappingAnomalyDetector())->detect();
        $this->assertNull($this->findMatch($matches, $Richer, $Poorer));
    }

    /**
     * StudentNumber carries a real DB-level UNIQUE KEY (Student::$fields),
     * so a live duplicate can only exist as pre-constraint/legacy drift --
     * the detector's whole reason to exist (see its class docblock). To
     * plant a genuine fixture pair, the constraint is dropped and restored
     * around just this one test.
     */
    public function testIdenticalStudentNumberDetectorFindsPlantedPair()
    {
        $number = 'dupe-'.uniqid();

        DB::nonQuery('ALTER TABLE `%s` DROP INDEX `StudentNumber`', [Person::$tableName]);

        try {
            $A = $this->makePerson(['FirstName' => 'SNumA', 'LastName' => 'FixtureSNum', 'Username' => 'snum-a-'.uniqid()], Student::class);
            $B = $this->makePerson(['FirstName' => 'SNumB', 'LastName' => 'FixtureSNum', 'Username' => 'snum-b-'.uniqid()], Student::class);

            DB::nonQuery('UPDATE `%s` SET StudentNumber = "%s" WHERE ID IN (%u, %u)', [Person::$tableName, DB::escape($number), $A->ID, $B->ID]);
        } finally {
            DB::nonQuery('ALTER TABLE `%s` ADD UNIQUE KEY `StudentNumber` (`StudentNumber`)', [Person::$tableName]);
        }

        $matches = (new IdenticalStudentNumberDetector())->detect();
        $match = $this->findMatch($matches, $A, $B);

        $this->assertNotNull($match, 'identical Student Number pair was not found');
        $this->assertEquals($number, $match['evidence']['studentNumber']);
    }

    public function testIdenticalStudentNumberDetectorIgnoresDifferingNumbers()
    {
        $A = $this->makePerson(['FirstName' => 'SNumC', 'LastName' => 'FixtureSNum', 'Username' => 'snum-c-'.uniqid(), 'StudentNumber' => 'unique-a-'.uniqid()], Student::class);
        $B = $this->makePerson(['FirstName' => 'SNumD', 'LastName' => 'FixtureSNum', 'Username' => 'snum-d-'.uniqid(), 'StudentNumber' => 'unique-b-'.uniqid()], Student::class);

        $matches = (new IdenticalStudentNumberDetector())->detect();
        $this->assertNull($this->findMatch($matches, $A, $B));
    }
}
