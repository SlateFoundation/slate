<?php

namespace Slate\TestsRW\People\Merge;

use DB;
use Emergence\People\Person;
use Exception;
use Slate\People\Merge\ActionExecutorRegistry;
use Slate\People\Merge\FollowUpAction;
use Slate\People\Merge\MergeAudit;

/**
 * Unit-level coverage of FollowUpAction's status lifecycle (used by both
 * the execute and manual-outcome PATCH endpoints). Requires a live DB via
 * the full Emergence/Slate runtime; not runnable outside a composed site.
 */
class FollowUpActionTest extends \PHPUnit_Framework_TestCase
{
    protected static $SourcePerson;
    protected static $TargetPerson;
    protected static $Audit;

    protected function setUp(): void
    {
        static::$SourcePerson = Person::create(['FirstName' => 'FollowUpTestSource', 'LastName' => 'Fixture'], true);
        static::$TargetPerson = Person::create(['FirstName' => 'FollowUpTestTarget', 'LastName' => 'Fixture'], true);

        static::$Audit = MergeAudit::create([
            'SourcePersonID' => static::$SourcePerson->ID,
            'TargetPersonID' => static::$TargetPerson->ID,
        ], true);
    }

    protected function tearDown(): void
    {
        DB::nonQuery('DELETE FROM `%s` WHERE MergeAuditID = %u', [FollowUpAction::$tableName, static::$Audit->ID]);
        DB::nonQuery('DELETE FROM `%s` WHERE ID = %u', [MergeAudit::$tableName, static::$Audit->ID]);
        DB::nonQuery('DELETE FROM `%s` WHERE ID IN (%u, %u)', [Person::$tableName, static::$SourcePerson->ID, static::$TargetPerson->ID]);

        ActionExecutorRegistry::reset();
    }

    protected function makeAction(): FollowUpAction
    {
        return FollowUpAction::create([
            'MergeAuditID' => static::$Audit->ID,
            'Type' => 'followup-test-type',
            'Connector' => 'followup-test-connector',
            'Payload' => ['foo' => 'bar'],
        ], true);
    }

    public function testPendingTransitionsToCompletedWithNotes()
    {
        $Action = $this->makeAction();

        $Action->recordOutcome(FollowUpAction::STATUS_COMPLETED, 'done by hand');
        $Action->save();

        $this->assertEquals(FollowUpAction::STATUS_COMPLETED, $Action->Status);
        $this->assertCount(1, $Action->OutcomeLog);
        $this->assertEquals('done by hand', $Action->OutcomeLog[0]['notes']);
    }

    public function testEmptyNotesAreRejected()
    {
        $Action = $this->makeAction();

        $this->expectException(Exception::class);
        $Action->recordOutcome(FollowUpAction::STATUS_SKIPPED, '');
    }

    public function testCompletedIsTerminal()
    {
        $Action = $this->makeAction();
        $Action->recordOutcome(FollowUpAction::STATUS_COMPLETED, 'done');
        $Action->save();

        $this->expectException(Exception::class);
        $Action->recordOutcome(FollowUpAction::STATUS_PENDING, 'try to reopen');
    }

    public function testFailedActionIsRetryable()
    {
        $Action = $this->makeAction();
        $Action->recordOutcome(FollowUpAction::STATUS_FAILED, 'external call failed');
        $Action->save();

        $Action->recordOutcome(FollowUpAction::STATUS_PENDING, 'retrying');
        $Action->save();

        $this->assertEquals(FollowUpAction::STATUS_PENDING, $Action->Status);
        $this->assertCount(2, $Action->OutcomeLog);
    }

    public function testHasExecutorReflectsRegistry()
    {
        $Action = $this->makeAction();
        $this->assertFalse($Action->hasExecutor());

        ActionExecutorRegistry::register('followup-test-type', new class implements \Slate\People\Merge\ActionExecutorInterface {
            public function execute(FollowUpAction $Action): string
            {
                return 'ok';
            }
        });

        $this->assertTrue($Action->hasExecutor());
    }
}
