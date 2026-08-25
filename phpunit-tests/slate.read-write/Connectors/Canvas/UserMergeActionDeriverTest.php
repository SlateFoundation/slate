<?php

namespace Slate\TestsRW\Connectors\Canvas;

use DB;
use Emergence\Connectors\Mapping;
use Emergence\People\Person;
use Slate\Connectors\Canvas\Connector;
use Slate\Connectors\Canvas\UserMergeActionDeriver;
use Slate\People\Merge\ActionExecutorRegistry;
use Slate\People\Merge\FollowUpAction;
use Slate\People\Merge\MappingActionDeriverRegistry;
use Slate\People\Merge\Merge;
use Slate\People\Merge\MergeAudit;
use Slate\People\Merge\MergeConflictException;
use Slate\People\Student;

/**
 * Covers the direction-derivation checklist item in
 * plans/canvas-merge-executor.md's Validation section, against the
 * production connector_mappings convention: a `canvas` mapping's
 * ExternalKey is the constant 'user[id]' and its ExternalIdentifier is the
 * numeric Canvas user id (see UserMergeActionDeriver::EXTERNAL_KEY and the
 * plan's Notes for the production-data finding that corrected an earlier,
 * flipped convention).
 *
 * Also covers the Merge::getIdentityConflicts()/mergeConnectorMappings()
 * special-casing a deriver-owned connector required: cross-account
 * divergence spawns a follow-up action instead of forcing a
 * conflict-resolution choice, the source's divergent mapping is retired
 * (not moved) so the target ends with exactly one canvas mapping, and a
 * connector with no registered deriver is unaffected -- it keeps the
 * original conflict/resolution path exactly.
 *
 * Requires a live DB via the full Emergence/Slate runtime (see
 * .analysis-context/php-core/handlers/phpunit.php) -- not runnable outside
 * a composed site; CI is the authoritative gate for this suite. Mirrors the
 * fixture/teardown shape of phpunit-tests/slate.read-write/People/Merge/MergeTest.php.
 */
class UserMergeActionDeriverTest extends \PHPUnit_Framework_TestCase
{
    protected static $Source;
    protected static $Target;

    protected function setUp(): void
    {
        static::$Source = Student::create([
            'FirstName' => 'CanvasDeriverTestSource',
            'LastName' => 'Fixture',
            'Username' => 'canvas-deriver-test-src-'.uniqid(),
        ], true);

        static::$Target = Student::create([
            'FirstName' => 'CanvasDeriverTestTarget',
            'LastName' => 'Fixture',
            'Username' => 'canvas-deriver-test-tgt-'.uniqid(),
        ], true);

        // registered explicitly rather than relying on
        // php-config/Slate.config.d/canvas-merge-executor.php having run,
        // so this suite doesn't depend on full app bootstrap
        Connector::register();
    }

    protected function tearDown(): void
    {
        $ids = array_filter([static::$Source?->ID, static::$Target?->ID]);

        if (count($ids) > 0) {
            $idList = implode(',', $ids);

            DB::nonQuery('DELETE FROM `%s` WHERE ContextClass = "%s" AND ContextID IN (%s)', [Mapping::$tableName, DB::escape(Person::getRootClass()), $idList]);
            DB::nonQuery('DELETE FROM `%s` WHERE MergeAuditID IN (SELECT ID FROM `%s` WHERE SourcePersonID IN (%s) OR TargetPersonID IN (%s))', [FollowUpAction::$tableName, MergeAudit::$tableName, $idList, $idList]);
            DB::nonQuery('DELETE FROM `%s` WHERE SourcePersonID IN (%s) OR TargetPersonID IN (%s)', [MergeAudit::$tableName, $idList, $idList]);
            DB::nonQuery('DELETE FROM `%s` WHERE ID IN (%s)', [Person::$tableName, $idList]);
        }

        MappingActionDeriverRegistry::reset();
        ActionExecutorRegistry::reset();
    }

    protected function createCanvasMapping(int $personID, string $canvasUserID): void
    {
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => $personID,
            'Source' => 'manual', 'Connector' => Connector::CONNECTOR_KEY,
            'ExternalKey' => UserMergeActionDeriver::EXTERNAL_KEY, 'ExternalIdentifier' => $canvasUserID,
        ], true);
    }

    public function testMergeSpawnsCanvasUserMergeActionWithCorrectDirectionAndNoMappingConflict()
    {
        $this->createCanvasMapping(static::$Source->ID, '1384');
        $this->createCanvasMapping(static::$Target->ID, '2716');

        // no MergeConflictException, no resolutions needed -- the deriver
        // owns this divergence, per Merge::getIdentityConflicts()
        $Audit = Merge::execute(static::$Source, static::$Target);

        $actions = FollowUpAction::getAllByWhere([
            'MergeAuditID' => $Audit->ID,
            'Type' => Connector::ACTION_TYPE_USER_MERGE,
        ]);
        $this->assertCount(1, $actions);

        $Action = $actions[0];
        $this->assertEquals(Connector::CONNECTOR_KEY, $Action->Connector);
        $this->assertEquals(FollowUpAction::STATUS_PENDING, $Action->Status);
        $this->assertTrue($Action->hasExecutor, 'canvas-user-merge should have a registered executor once Connector::register() has run');
        $this->assertEquals('1384', $Action->Payload['sourceCanvasUserID']);
        $this->assertEquals('2716', $Action->Payload['destinationCanvasUserID']);
    }

    public function testSourcesDivergentMappingIsRetiredNotMovedLeavingTargetWithExactlyOneCanvasMapping()
    {
        $this->createCanvasMapping(static::$Source->ID, '1384');
        $this->createCanvasMapping(static::$Target->ID, '2716');

        Merge::execute(static::$Source, static::$Target);

        $targetMappings = Mapping::getAllByWhere([
            'ContextClass' => Person::getRootClass(),
            'ContextID' => static::$Target->ID,
            'Connector' => Connector::CONNECTOR_KEY,
        ]);
        $this->assertCount(1, $targetMappings);
        $this->assertEquals('2716', $targetMappings[0]->ExternalIdentifier, "the target's own mapping should be untouched, not overwritten by the source's");

        $sourceMappings = Mapping::getAllByWhere([
            'ContextClass' => Person::getRootClass(),
            'ContextID' => static::$Source->ID,
            'Connector' => Connector::CONNECTOR_KEY,
        ]);
        $this->assertCount(0, $sourceMappings, "the source's divergent mapping should be retired, not left behind");
    }

    public function testIdenticalCanvasIdentifiersOnBothSidesSpawnsNoActionSinceTheEngineAlreadyDedupes()
    {
        $this->createCanvasMapping(static::$Source->ID, '1384');
        $this->createCanvasMapping(static::$Target->ID, '1384');

        $Audit = Merge::execute(static::$Source, static::$Target);

        $actions = FollowUpAction::getAllByWhere([
            'MergeAuditID' => $Audit->ID,
            'Type' => Connector::ACTION_TYPE_USER_MERGE,
        ]);
        $this->assertCount(0, $actions);

        $targetMappings = Mapping::getAllByWhere([
            'ContextClass' => Person::getRootClass(),
            'ContextID' => static::$Target->ID,
            'Connector' => Connector::CONNECTOR_KEY,
        ]);
        $this->assertCount(1, $targetMappings, 'the exact duplicate should have been deduped, leaving exactly one');
    }

    public function testNoActionSpawnedWhenOnlyOneSideHasACanvasMapping()
    {
        $this->createCanvasMapping(static::$Target->ID, '2716');

        $Audit = Merge::execute(static::$Source, static::$Target);

        $actions = FollowUpAction::getAllByWhere([
            'MergeAuditID' => $Audit->ID,
            'Type' => Connector::ACTION_TYPE_USER_MERGE,
        ]);
        $this->assertCount(0, $actions);
    }

    public function testConnectorWithoutARegisteredDeriverStillGetsTheConflictResolutionPath()
    {
        // a divergent mapping on an unrelated connector with no deriver
        // registered -- must still halt execute until resolved, exactly
        // like before this connector's special-case existed
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => static::$Source->ID,
            'Source' => 'manual', 'Connector' => 'no-deriver-test-connector',
            'ExternalKey' => 'id', 'ExternalIdentifier' => 'source-external-id',
        ], true);
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => static::$Target->ID,
            'Source' => 'manual', 'Connector' => 'no-deriver-test-connector',
            'ExternalKey' => 'id', 'ExternalIdentifier' => 'target-external-id',
        ], true);

        try {
            Merge::execute(static::$Source, static::$Target);
            $this->fail('Expected MergeConflictException for the connector with no registered deriver');
        } catch (MergeConflictException $e) {
            $this->assertEquals('mapping:no-deriver-test-connector:id', $e->conflicts[0]['resolutionKey']);
        }

        // unresolved: no audit written
        $this->assertNull(MergeAudit::getByPreviousSource(static::$Source->ID));

        $Audit = Merge::execute(static::$Source, static::$Target, [
            'mapping:no-deriver-test-connector:id' => 'target-external-id',
        ]);
        $this->assertNotNull($Audit);
    }
}
