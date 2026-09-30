<?php

namespace Slate\TestsRW\Connectors\Canvas;

use DB;
use Emergence\People\ContactPoint\AbstractPoint;
use Emergence\People\Person;
use Exception;
use Slate\Connectors\Canvas\MergeSupport;
use Slate\Connectors\Canvas\UserMergeExecutor;
use Slate\People\Merge\FollowUpAction;
use Slate\People\Merge\MergeAudit;
use Slate\People\Student;

/**
 * Covers UserMergeExecutor::execute() end to end against real
 * FollowUpAction/MergeAudit/person records and a FakeCanvasClient double
 * instead of the live Canvas API -- the class seam is UserMergeExecutor's
 * constructor, which accepts any CanvasClientInterface. The Canvas
 * procedure's individual cases (plans/canvas-login-convergence.md) are
 * covered DB-free by UserMergeConvergenceTest; this class covers resolving
 * the survivor's identity from the action and the action's status
 * lifecycle around the executor.
 *
 * Fixtures build a MergeAudit + FollowUpAction directly (skipping
 * Merge::execute() -- direction derivation is covered separately by
 * UserMergeActionDeriverTest) so each test can drive the executor against a
 * controlled payload and a controlled fake API. The fake tenant's login IDs
 * are email addresses, as in real deployments.
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

        static::$Target->Email = static::$Target->Username.'@example.org';
        static::$Target->save();

        static::$Audit = MergeAudit::create([
            'SourcePersonID' => static::$Source->ID,
            'TargetPersonID' => static::$Target->ID,
        ], true);

        static::$Action = FollowUpAction::create([
            'MergeAuditID' => static::$Audit->ID,
            'Type' => MergeSupport::ACTION_TYPE_USER_MERGE,
            'Connector' => MergeSupport::CONNECTOR_KEY,
            'Payload' => [
                'sourceCanvasUserID' => '5001',
                'destinationCanvasUserID' => '5002',
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
            DB::nonQuery('DELETE FROM `%s` WHERE PersonID IN (%s)', [AbstractPoint::$tableName, $idList]);
            DB::nonQuery('DELETE FROM `%s` WHERE ID IN (%s)', [Person::$tableName, $idList]);
        }
    }

    /**
     * A tenant where the survivor's Canvas user (5002) has its email login
     * without an SIS ID, and the retired duplicate's user (5001) has an
     * email login carrying the survivor's username -- so execution has to
     * clear, then stamp.
     */
    protected function buildTenant(): FakeCanvasClient
    {
        $Client = new FakeCanvasClient();
        $Client->addUser('5001');
        $Client->addUser('5002');
        $Client->addLogin('5002', '902', static::$Target->Email, null);
        $Client->addLogin('5001', '901', 'duplicate-'.static::$Target->Email, static::$Target->Username);

        return $Client;
    }

    public function testExecuteResolvesTheSurvivorFromTheMergeAuditAndCompletes()
    {
        $Client = $this->buildTenant();

        $note = (new UserMergeExecutor($Client))->execute(static::$Action);

        $this->assertStringContainsString('Merged Canvas user 5001 into 5002', $note);
        $this->assertEquals(1, $Client->callCount('mergeUserInto'));

        // the survivor's email login -- found by the survivor's primary
        // email, not the username -- ends up with the username as SIS ID
        $this->assertEquals(static::$Target->Username, $Client->logins['902']['sis_user_id']);
        $this->assertNull($Client->logins['901']['sis_user_id']);

        static::$Action->recordOutcome(FollowUpAction::STATUS_COMPLETED, $note, 'executor:canvas');
        $this->assertEquals(FollowUpAction::STATUS_COMPLETED, static::$Action->Status);
    }

    public function testExecuteFailsBeforeMergingWhenPayloadIsIncomplete()
    {
        $Client = $this->buildTenant();
        static::$Action->Payload = ['sourceCanvasUserID' => '5001'];

        try {
            (new UserMergeExecutor($Client))->execute(static::$Action);
            $this->fail('Expected a precondition failure to throw');
        } catch (Exception $e) {
            $this->assertStringContainsString('direction is not derivable', $e->getMessage());
        }

        $this->assertEquals([], $Client->calls);
    }

    public function testFailureAfterMergeMarksActionFailedAndRetryResumes()
    {
        $Client = $this->buildTenant();
        $Client->failOn['updateLogin'] = 1;

        try {
            (new UserMergeExecutor($Client))->execute(static::$Action);
            $this->fail('Expected the simulated Canvas failure to throw');
        } catch (Exception $e) {
            static::$Action->recordOutcome(FollowUpAction::STATUS_FAILED, $e->getMessage(), 'executor:canvas');
        }

        $this->assertEquals(FollowUpAction::STATUS_FAILED, static::$Action->Status);
        $outcomeLog = static::$Action->OutcomeLog;
        $lastOutcome = end($outcomeLog);
        $this->assertStringContainsString('simulated Canvas outage', $lastOutcome['notes']);
        $this->assertStringContainsString('Re-execute this action to resume', $lastOutcome['notes']);

        // failed actions are retryable back to pending...
        static::$Action->recordOutcome(FollowUpAction::STATUS_PENDING, 're-attempting after the Canvas outage', 'operator');
        $this->assertEquals(FollowUpAction::STATUS_PENDING, static::$Action->Status);

        // ...and re-executing resumes after the merge that already happened
        $note = (new UserMergeExecutor($Client))->execute(static::$Action);
        static::$Action->recordOutcome(FollowUpAction::STATUS_COMPLETED, $note, 'executor:canvas');

        $this->assertEquals(FollowUpAction::STATUS_COMPLETED, static::$Action->Status);
        $this->assertEquals(1, $Client->callCount('mergeUserInto'));
        $this->assertStringContainsString('Resumed', $note);
    }
}
