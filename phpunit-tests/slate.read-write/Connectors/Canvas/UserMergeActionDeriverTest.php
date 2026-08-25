<?php

namespace Slate\TestsRW\Connectors\Canvas;

use DB;
use Emergence\Connectors\Mapping;
use Emergence\People\Person;
use Slate\Connectors\Canvas\Connector;
use Slate\People\Merge\ActionExecutorRegistry;
use Slate\People\Merge\FollowUpAction;
use Slate\People\Merge\MappingActionDeriverRegistry;
use Slate\People\Merge\Merge;
use Slate\People\Merge\MergeAudit;
use Slate\People\Student;

/**
 * Covers the direction-derivation checklist item in
 * plans/canvas-merge-executor.md's Validation section: a merge touching
 * Canvas mappings on both records spawns a canvas-user-merge action with
 * the correct direction (survivor = the person the merge's Target
 * represents).
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

    public function testMergeSpawnsCanvasUserMergeActionWithCorrectDirection()
    {
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => static::$Source->ID,
            'Source' => 'manual', 'Connector' => Connector::CONNECTOR_KEY,
            'ExternalKey' => '5001', 'ExternalIdentifier' => static::$Source->Username,
        ], true);
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => static::$Target->ID,
            'Source' => 'manual', 'Connector' => Connector::CONNECTOR_KEY,
            'ExternalKey' => '5002', 'ExternalIdentifier' => static::$Target->Username,
        ], true);

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
        $this->assertEquals('5001', $Action->Payload['sourceCanvasUserID']);
        $this->assertEquals('5002', $Action->Payload['destinationCanvasUserID']);
        $this->assertEquals(static::$Target->Username, $Action->Payload['survivorUsername']);
    }

    public function testNoActionSpawnedWhenOnlyOneSideHasACanvasMapping()
    {
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => static::$Target->ID,
            'Source' => 'manual', 'Connector' => Connector::CONNECTOR_KEY,
            'ExternalKey' => '5002', 'ExternalIdentifier' => static::$Target->Username,
        ], true);

        $Audit = Merge::execute(static::$Source, static::$Target);

        $actions = FollowUpAction::getAllByWhere([
            'MergeAuditID' => $Audit->ID,
            'Type' => Connector::ACTION_TYPE_USER_MERGE,
        ]);
        $this->assertCount(0, $actions);
    }

    public function testPicksMappingMatchingUsernameWhenPersonHasMultipleCanvasMappings()
    {
        // a stray/incorrect mapping alongside the real one on the source --
        // the deriver must pick the row whose SIS identifier matches the
        // person's own username, not just the first one found
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => static::$Source->ID,
            'Source' => 'manual', 'Connector' => Connector::CONNECTOR_KEY,
            'ExternalKey' => '9999', 'ExternalIdentifier' => 'someone-elses-sis-id',
        ], true);
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => static::$Source->ID,
            'Source' => 'manual', 'Connector' => Connector::CONNECTOR_KEY,
            'ExternalKey' => '5001', 'ExternalIdentifier' => static::$Source->Username,
        ], true);
        Mapping::create([
            'ContextClass' => Person::getRootClass(), 'ContextID' => static::$Target->ID,
            'Source' => 'manual', 'Connector' => Connector::CONNECTOR_KEY,
            'ExternalKey' => '5002', 'ExternalIdentifier' => static::$Target->Username,
        ], true);

        $Audit = Merge::execute(static::$Source, static::$Target);

        $actions = FollowUpAction::getAllByWhere([
            'MergeAuditID' => $Audit->ID,
            'Type' => Connector::ACTION_TYPE_USER_MERGE,
        ]);
        $this->assertCount(1, $actions);
        $this->assertEquals('5001', $actions[0]->Payload['sourceCanvasUserID']);
    }
}
