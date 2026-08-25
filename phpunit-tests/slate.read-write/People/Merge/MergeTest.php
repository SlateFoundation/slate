<?php

namespace Slate\TestsRW\People\Merge;

use DB;
use Emergence\Comments\Comment;
use Emergence\Connectors\Mapping;
use Emergence\People\ContactPoint\Email;
use Emergence\People\Person;
use Exception;
use Slate\People\Merge\FollowUpAction;
use Slate\People\Merge\MappingActionDeriverRegistry;
use Slate\People\Merge\Merge;
use Slate\People\Merge\MergeAudit;
use Slate\People\Merge\MergeConflictException;
use Slate\People\Merge\MergeRegistry;
use Slate\People\Student;

/**
 * Covers the Validation checklist in plans/person-merge-engine.md. Requires
 * a live DB via the full Emergence/Slate runtime (see
 * .analysis-context/php-core/handlers/phpunit.php) -- not runnable outside
 * a composed site; CI is the authoritative gate for this suite.
 */
class MergeTest extends \PHPUnit_Framework_TestCase
{
    protected static $Source;
    protected static $Target;

    protected function setUp(): void
    {
        static::$Source = Student::create([
            'FirstName' => 'MergeTestSource',
            'LastName' => 'Fixture',
            'StudentNumber' => 'merge-test-src-'.uniqid(),
        ], true);

        static::$Target = Student::create([
            'FirstName' => 'MergeTestTarget',
            'LastName' => 'Fixture',
            'StudentNumber' => 'merge-test-tgt-'.uniqid(),
        ], true);
    }

    protected function tearDown(): void
    {
        $ids = array_filter([static::$Source?->ID, static::$Target?->ID]);
        if (!$ids) {
            return;
        }

        $idList = implode(',', $ids);

        DB::nonQuery('DELETE FROM `%s` WHERE PersonID IN (%s)', [\Emergence\People\ContactPoint\AbstractPoint::$tableName, $idList]);
        DB::nonQuery('DELETE FROM `%s` WHERE CreatorID IN (%s)', [Comment::$tableName, $idList]);
        DB::nonQuery('DELETE FROM `%s` WHERE ContextClass = "%s" AND ContextID IN (%s)', [Mapping::$tableName, DB::escape(Person::getRootClass()), $idList]);
        DB::nonQuery('DELETE FROM `%s` WHERE MergeAuditID IN (SELECT ID FROM `%s` WHERE SourcePersonID IN (%s) OR TargetPersonID IN (%s))', [FollowUpAction::$tableName, MergeAudit::$tableName, $idList, $idList]);
        DB::nonQuery('DELETE FROM `%s` WHERE SourcePersonID IN (%s) OR TargetPersonID IN (%s)', [MergeAudit::$tableName, $idList, $idList]);
        DB::nonQuery('DELETE FROM `%s` WHERE ID IN (%s)', [Person::$tableName, $idList]);

        MappingActionDeriverRegistry::reset();
    }

    public function testFixtureMergeMovesRegisteredTablesAndDedupes()
    {
        // comments: plain reassign
        Comment::create(['Context' => static::$Source, 'Message' => 'note about source'], true);

        // contact points: one moves, one dedupes against target's existing point
        $sharedEmail = 'shared-'.uniqid().'@example.com';
        Email::fromString($sharedEmail, static::$Target, true);
        Email::fromString($sharedEmail, static::$Source, true); // duplicate -- should be dropped
        Email::fromString('unique-'.uniqid().'@example.com', static::$Source, true); // unique -- should move

        $Audit = Merge::execute(static::$Source, static::$Target);

        // no comments left keyed to the (now tombstoned) source
        $this->assertEquals(0, (int) DB::oneValue('SELECT COUNT(*) FROM `%s` WHERE CreatorID = %u', [Comment::$tableName, static::$Source->ID]));

        // no contact points left keyed to source
        $this->assertEquals(0, (int) DB::oneValue('SELECT COUNT(*) FROM `%s` WHERE PersonID = %u', [\Emergence\People\ContactPoint\AbstractPoint::$tableName, static::$Source->ID]));

        // target ends up with exactly one copy of the shared email (deduped) plus the unique one
        $targetEmailCount = (int) DB::oneValue(
            'SELECT COUNT(*) FROM `%s` WHERE PersonID = %u AND Class = "%s"',
            [\Emergence\People\ContactPoint\AbstractPoint::$tableName, static::$Target->ID, DB::escape(Email::class)]
        );
        $this->assertEquals(2, $targetEmailCount);

        $counts = $Audit->TableCounts;
        $this->assertEquals(1, $counts['core.comments']['moved']);
        $this->assertEquals(1, $counts['core.contact-points']['moved']);
        $this->assertEquals(1, $counts['core.contact-points']['deduped']);

        // source is tombstoned, not deleted
        $SourceReloaded = Person::getByID(static::$Source->ID);
        $this->assertEquals('Disabled', $SourceReloaded->AccountLevel);
        $this->assertNotEquals(static::$Source->Username, $SourceReloaded->Username, 'username was reassigned aside');
    }

    public function testIdentityConflictHaltsExecuteUntilResolved()
    {
        static::$Source->StudentNumber = 'conflict-src-'.uniqid();
        static::$Source->save();
        static::$Target->StudentNumber = 'conflict-tgt-'.uniqid();
        static::$Target->save();

        try {
            Merge::execute(static::$Source, static::$Target);
            $this->fail('Expected MergeConflictException');
        } catch (MergeConflictException $e) {
            $this->assertNotEmpty($e->conflicts);
            $this->assertEquals('StudentNumber', $e->conflicts[0]['resolutionKey']);
        }

        // unresolved: no audit written, both records untouched
        $this->assertNull(MergeAudit::getByPreviousSource(static::$Source->ID));

        // resolved: target's value wins
        $Audit = Merge::execute(static::$Source, static::$Target, [
            'StudentNumber' => static::$Target->StudentNumber,
        ]);

        $this->assertNotNull($Audit);
        $TargetReloaded = Person::getByID(static::$Target->ID);
        $this->assertEquals(static::$Target->StudentNumber, $TargetReloaded->StudentNumber);
    }

    public function testMidMergeFailureRollsBackBothRecordsUnchanged()
    {
        $originalSourceUsername = static::$Source->Username;
        $originalSourceLevel = static::$Source->AccountLevel;
        $originalTargetFirstName = static::$Target->FirstName;

        MergeRegistry::register('test.force-failure', [
            'label' => 'Force Failure (test only)',
            'mover' => function ($Source, $Target, $dryRun) {
                if (!$dryRun) {
                    throw new Exception('forced failure for test');
                }
                return ['moved' => 0, 'deduped' => 0];
            },
        ]);

        try {
            try {
                Merge::execute(static::$Source, static::$Target);
                $this->fail('Expected the forced exception to propagate');
            } catch (Exception $e) {
                $this->assertEquals('forced failure for test', $e->getMessage());
            }
        } finally {
            MergeRegistry::unregister('test.force-failure');
        }

        $this->assertNull(MergeAudit::getByPreviousSource(static::$Source->ID));

        $SourceReloaded = Person::getByID(static::$Source->ID);
        $TargetReloaded = Person::getByID(static::$Target->ID);
        $this->assertEquals($originalSourceUsername, $SourceReloaded->Username);
        $this->assertEquals($originalSourceLevel, $SourceReloaded->AccountLevel);
        $this->assertEquals($originalTargetFirstName, $TargetReloaded->FirstName);
    }

    public function testRepeatedExecuteReturnsPriorAudit()
    {
        $FirstAudit = Merge::execute(static::$Source, static::$Target);
        $SecondAudit = Merge::execute(static::$Source, static::$Target);

        $this->assertEquals($FirstAudit->ID, $SecondAudit->ID);
    }

    public function testMappingMergeSpawnsFollowUpActionsAtomically()
    {
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => static::$Source->ID,
            'Source' => 'manual', 'Connector' => 'merge-test-connector',
            'ExternalKey' => 'id', 'ExternalIdentifier' => 'source-external-id',
        ], true);
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => static::$Target->ID,
            'Source' => 'manual', 'Connector' => 'merge-test-connector',
            'ExternalKey' => 'sis-id', 'ExternalIdentifier' => 'target-external-id',
        ], true);

        MappingActionDeriverRegistry::register('merge-test-connector', function ($Source, $Target, $sourceMappings, $targetMappings) {
            return [['type' => 'merge-test-user-merge', 'payload' => ['sourceExternalID' => $sourceMappings[0]->ExternalIdentifier]]];
        });

        $countBefore = FollowUpAction::getCount();

        $Audit = Merge::execute(static::$Source, static::$Target);

        $actions = FollowUpAction::getAllByWhere(['MergeAuditID' => $Audit->ID]);
        $this->assertCount(1, $actions);
        $this->assertEquals('merge-test-user-merge', $actions[0]->Type);
        $this->assertEquals('merge-test-connector', $actions[0]->Connector);
        $this->assertEquals(FollowUpAction::STATUS_PENDING, $actions[0]->Status);
        $this->assertEquals($countBefore + 1, FollowUpAction::getCount());
    }

    public function testRolledBackMergeSpawnsNoFollowUpActions()
    {
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => static::$Source->ID,
            'Source' => 'manual', 'Connector' => 'merge-test-connector',
            'ExternalKey' => 'id', 'ExternalIdentifier' => 'source-external-id',
        ], true);
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => static::$Target->ID,
            'Source' => 'manual', 'Connector' => 'merge-test-connector',
            'ExternalKey' => 'sis-id', 'ExternalIdentifier' => 'target-external-id',
        ], true);

        MappingActionDeriverRegistry::register('merge-test-connector', function () {
            return [['type' => 'merge-test-user-merge', 'payload' => []]];
        });

        MergeRegistry::register('test.force-failure', [
            'label' => 'Force Failure (test only)',
            'mover' => function ($Source, $Target, $dryRun) {
                if (!$dryRun) {
                    throw new Exception('forced failure for test');
                }
                return ['moved' => 0, 'deduped' => 0];
            },
        ]);

        $countBefore = FollowUpAction::getCount();

        try {
            try {
                Merge::execute(static::$Source, static::$Target);
                $this->fail('Expected the forced exception to propagate');
            } catch (Exception $e) {
                // expected
            }
        } finally {
            MergeRegistry::unregister('test.force-failure');
        }

        $this->assertEquals($countBefore, FollowUpAction::getCount());
    }
}
