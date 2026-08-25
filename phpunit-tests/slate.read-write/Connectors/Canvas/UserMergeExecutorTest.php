<?php

namespace Slate\TestsRW\Connectors\Canvas;

use DB;
use Emergence\People\Person;
use Exception;
use Slate\Connectors\Canvas\Connector;
use Slate\Connectors\Canvas\UserMergeExecutor;
use Slate\People\Merge\FollowUpAction;
use Slate\People\Merge\MergeAudit;
use Slate\People\Student;

/**
 * Covers the executor-procedure checklist items in
 * plans/canvas-merge-executor.md's Validation section, against a
 * FakeCanvasClient double instead of the live Canvas API -- the class seam
 * is UserMergeExecutor's constructor, which accepts any CanvasClientInterface.
 *
 * Fixtures build a MergeAudit + FollowUpAction directly (skipping
 * Merge::execute() -- direction derivation is covered separately by
 * UserMergeActionDeriverTest) so each test can drive the executor against a
 * controlled payload and a controlled fake API.
 *
 * Requires a live DB via the full Emergence/Slate runtime (see
 * .analysis-context/php-core/handlers/phpunit.php) -- not runnable outside
 * a composed site; CI is the authoritative gate for this suite.
 */
class UserMergeExecutorTest extends \PHPUnit_Framework_TestCase
{
    protected static $Source;
    protected static $Target;
    protected static $Audit;
    protected static $Action;

    protected function setUp(): void
    {
        static::$Source = Student::create([
            'FirstName' => 'CanvasExecutorTestSource',
            'LastName' => 'Fixture',
            'Username' => 'canvas-executor-test-src-'.uniqid(),
        ], true);

        static::$Target = Student::create([
            'FirstName' => 'CanvasExecutorTestTarget',
            'LastName' => 'Fixture',
            'Username' => 'canvas-executor-test-tgt-'.uniqid(),
        ], true);

        static::$Audit = MergeAudit::create([
            'SourcePersonID' => static::$Source->ID,
            'TargetPersonID' => static::$Target->ID,
        ], true);

        static::$Action = FollowUpAction::create([
            'MergeAuditID' => static::$Audit->ID,
            'Type' => Connector::ACTION_TYPE_USER_MERGE,
            'Connector' => Connector::CONNECTOR_KEY,
            'Payload' => [
                'sourceCanvasUserID' => '5001',
                'destinationCanvasUserID' => '5002',
                'survivorUsername' => static::$Target->Username,
            ],
        ], true);
    }

    protected function tearDown(): void
    {
        $ids = array_filter([static::$Source?->ID, static::$Target?->ID]);

        if (count($ids) > 0) {
            $idList = implode(',', $ids);

            DB::nonQuery('DELETE FROM `%s` WHERE MergeAuditID IN (SELECT ID FROM `%s` WHERE SourcePersonID IN (%s) OR TargetPersonID IN (%s))', [FollowUpAction::$tableName, MergeAudit::$tableName, $idList, $idList]);
            DB::nonQuery('DELETE FROM `%s` WHERE SourcePersonID IN (%s) OR TargetPersonID IN (%s)', [MergeAudit::$tableName, $idList, $idList]);
            DB::nonQuery('DELETE FROM `%s` WHERE ID IN (%s)', [Person::$tableName, $idList]);
        }
    }

    public function testExecuteRunsFullProcedureInOrderAndCompletesOnlyAfterVerification()
    {
        $Client = new FakeCanvasClient();
        $Client->users['5001'] = ['id' => '5001'];
        $Client->users['5002'] = ['id' => '5002'];
        $Client->logins['5002'] = [
            ['id' => '900', 'account_id' => '1', 'unique_id' => static::$Target->Username, 'sis_user_id' => static::$Target->Username],
        ];
        $Client->usersBySisID[static::$Target->Username] = ['id' => '5002'];

        $note = (new UserMergeExecutor($Client))->execute(static::$Action);

        $this->assertStringContainsString('5001', $note);
        $this->assertStringContainsString('5002', $note);

        // preconditions before the external merge, then merge_into, then
        // normalization, then verification -- in that order
        $methodOrder = array_column($Client->calls, 0);
        $this->assertEquals(
            ['getUser', 'getUser', 'mergeUserInto', 'getUserLogins', 'getUserBySisID'],
            $methodOrder
        );

        // the survivor's login already carries the correct sis_user_id --
        // nothing to normalize, so no write call
        $this->assertEquals(0, $Client->callCount('updateLogin'));

        static::$Action->recordOutcome(FollowUpAction::STATUS_COMPLETED, $note, 'executor:canvas');
        $this->assertEquals(FollowUpAction::STATUS_COMPLETED, static::$Action->Status);
    }

    public function testExecuteClearsStaleSisUserIdDraggedOverByTheMerge()
    {
        $Client = new FakeCanvasClient();
        $Client->users['5001'] = ['id' => '5001'];
        $Client->users['5002'] = ['id' => '5002'];
        $Client->logins['5002'] = [
            // the survivor's own login -- no sis_user_id stamped yet
            ['id' => '900', 'account_id' => '1', 'unique_id' => static::$Target->Username, 'sis_user_id' => null],
            // a login the merge dragged over from the retired source,
            // still carrying the *source's* sis_user_id -- stale
            ['id' => '901', 'account_id' => '1', 'unique_id' => 'some-other-login', 'sis_user_id' => static::$Source->Username],
        ];
        $Client->usersBySisID[static::$Target->Username] = ['id' => '5002'];

        (new UserMergeExecutor($Client))->execute(static::$Action);

        $clearCall = null;
        $stampCall = null;
        foreach ($Client->calls as $call) {
            if ($call[0] !== 'updateLogin') {
                continue;
            }
            if ($call[3]['sis_user_id'] === '') {
                $clearCall = $call;
            } elseif ($call[3]['sis_user_id'] === static::$Target->Username) {
                $stampCall = $call;
            }
        }

        $this->assertNotNull($clearCall, 'the stale sis_user_id should have been cleared');
        $this->assertEquals('901', $clearCall[2]);

        $this->assertNotNull($stampCall, "the survivor's login should have been stamped with its own username");
        $this->assertEquals('900', $stampCall[2]);
    }

    public function testExecuteFailsWhenVerificationDoesNotResolveToDestination()
    {
        $Client = new FakeCanvasClient();
        $Client->users['5001'] = ['id' => '5001'];
        $Client->users['5002'] = ['id' => '5002'];
        $Client->logins['5002'] = [
            ['id' => '900', 'account_id' => '1', 'unique_id' => static::$Target->Username, 'sis_user_id' => static::$Target->Username],
        ];
        // sis_user_id lookup doesn't resolve at all post-merge

        try {
            (new UserMergeExecutor($Client))->execute(static::$Action);
            $this->fail('Expected verification failure to throw');
        } catch (Exception $e) {
            $this->assertStringContainsString('Verification failed', $e->getMessage());
        }

        // the (irreversible) external merge did happen -- verification is a
        // check on its result, not a precondition
        $this->assertEquals(1, $Client->callCount('mergeUserInto'));
    }

    public function testExecuteFailsWithoutCallingMergeWhenDestinationUserIsAbsent()
    {
        $Client = new FakeCanvasClient();
        $Client->users['5001'] = ['id' => '5001'];
        // 5002 (destination) is absent -- e.g. deleted since the merge was queued

        try {
            (new UserMergeExecutor($Client))->execute(static::$Action);
            $this->fail('Expected a precondition failure to throw');
        } catch (Exception $e) {
            $this->assertStringContainsString('no longer exists', $e->getMessage());
        }

        $this->assertEquals(0, $Client->callCount('mergeUserInto'));
    }

    public function testExecuteFailsWithoutCallingMergeWhenSourceAlreadyMerged()
    {
        $Client = new FakeCanvasClient();
        $Client->users['5002'] = ['id' => '5002'];
        // Canvas resolves the old source ID as an alias of the destination
        // -- a prior merge already happened
        $Client->users['5001'] = ['id' => '5002'];

        try {
            (new UserMergeExecutor($Client))->execute(static::$Action);
            $this->fail('Expected a precondition failure to throw');
        } catch (Exception $e) {
            $this->assertStringContainsString('already', strtolower($e->getMessage()));
        }

        $this->assertEquals(0, $Client->callCount('mergeUserInto'));
    }

    public function testCanvasFailureMarksActionFailedWithErrorCapturedAndStaysRetryable()
    {
        $Client = new FakeCanvasClient();
        $Client->users['5001'] = ['id' => '5001'];
        $Client->users['5002'] = ['id' => '5002'];
        $Client->failMergeInto = true;

        try {
            (new UserMergeExecutor($Client))->execute(static::$Action);
            $this->fail('Expected the simulated Canvas failure to throw');
        } catch (Exception $e) {
            static::$Action->recordOutcome(FollowUpAction::STATUS_FAILED, $e->getMessage(), 'executor:canvas');
        }

        $this->assertEquals(FollowUpAction::STATUS_FAILED, static::$Action->Status);
        $outcomeLog = static::$Action->OutcomeLog;
        $lastOutcome = end($outcomeLog);
        $this->assertStringContainsString('simulated failure', $lastOutcome['notes']);

        // failed actions are retryable back to pending...
        static::$Action->recordOutcome(FollowUpAction::STATUS_PENDING, 're-attempting after fixing the Canvas outage', 'operator');
        $this->assertEquals(FollowUpAction::STATUS_PENDING, static::$Action->Status);

        // ...and a subsequent execute against a healthy API succeeds
        $Client->failMergeInto = false;
        $Client->logins['5002'] = [
            ['id' => '900', 'account_id' => '1', 'unique_id' => static::$Target->Username, 'sis_user_id' => static::$Target->Username],
        ];
        $Client->usersBySisID[static::$Target->Username] = ['id' => '5002'];

        $note = (new UserMergeExecutor($Client))->execute(static::$Action);
        static::$Action->recordOutcome(FollowUpAction::STATUS_COMPLETED, $note, 'executor:canvas');
        $this->assertEquals(FollowUpAction::STATUS_COMPLETED, static::$Action->Status);
    }
}
