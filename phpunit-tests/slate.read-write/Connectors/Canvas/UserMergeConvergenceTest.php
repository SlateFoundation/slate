<?php

namespace Slate\TestsRW\Connectors\Canvas;

use Exception;
use Slate\Connectors\Canvas\UserMergeExecutor;
use Slate\People\Student;

/**
 * Covers UserMergeExecutor's Canvas procedure (plans/canvas-login-convergence.md)
 * against a FakeCanvasClient shaped like a real tenant: login IDs are email
 * addresses, and after merge_into the survivor holds both users' logins.
 *
 * Drives UserMergeExecutor::converge() with plain identity values, so
 * unlike UserMergeExecutorTest this class needs no database -- only the
 * connector-sync dry-run cases construct an (unsaved) person record.
 *
 * Fixture identity throughout: the surviving Slate person is `jdoe` with
 * primary email jdoe@example.org; Canvas user 5002 is theirs (the
 * destination), 5001 belongs to the retired duplicate (the source).
 */
class UserMergeConvergenceTest extends \PHPUnit_Framework_TestCase
{
    protected const SOURCE = '5001';
    protected const DESTINATION = '5002';
    protected const USERNAME = 'jdoe';
    protected const EMAIL = 'jdoe@example.org';

    protected FakeCanvasClient $Client;

    protected function setUp(): void
    {
        $this->Client = new FakeCanvasClient();
        $this->Client->addUser(static::SOURCE);
        $this->Client->addUser(static::DESTINATION);

        FakeCanvasConnector::reset();
        FakeCanvasConnectorWithoutPretend::$pushUserCalls = 0;
    }

    protected function tearDown(): void
    {
        UserMergeExecutor::$connectorClass = 'Slate\Connectors\Canvas\Connector';
    }

    protected function converge(string $email = self::EMAIL, $Survivor = null): string
    {
        return (new UserMergeExecutor($this->Client))->converge(static::SOURCE, static::DESTINATION, static::USERNAME, $email, $Survivor);
    }

    /**
     * @return string the exception message
     */
    protected function convergeExpectingFailure(string $email = self::EMAIL, $Survivor = null): string
    {
        try {
            $this->converge($email, $Survivor);
        } catch (Exception $e) {
            return $e->getMessage();
        }

        $this->fail('Expected the executor to throw');
    }

    /**
     * Asserts the survivor satisfies the login convergence contract.
     */
    protected function assertConverged(string $expectedSignInLoginID): void
    {
        $withUsername = [];
        foreach ($this->Client->loginsOf(static::DESTINATION) as $login) {
            if ($login['sis_user_id'] === static::USERNAME) {
                $withUsername[] = $login['id'];
            } else {
                $this->assertNull($login['sis_user_id'], "login {$login['id']} should have had its SIS ID cleared");
            }
        }

        $this->assertEquals([$expectedSignInLoginID], $withUsername, 'exactly one login -- the sign-in login -- carries the username');
        $this->assertEquals(static::EMAIL, strtolower(trim($this->Client->logins[$expectedSignInLoginID]['unique_id'])));
    }

    public function testHappyPathWithEmailLoginIDs()
    {
        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe@example.org', 'jdoe');
        $this->Client->addLogin(static::SOURCE, '901', 'john.doe@example.org', 'jdoe2');

        $note = $this->converge();

        // the survivor ends up holding both logins -- nothing deleted
        $this->assertEquals(['902', '901'], array_column($this->Client->loginsOf(static::DESTINATION), 'id'));
        $this->assertEquals(static::DESTINATION, $this->Client->users[static::SOURCE]['merged_into_user_id']);
        $this->assertConverged('902');

        // read-only planning before the one merge, writes after it
        $this->assertEquals(
            ['getUser', 'getUser', 'getUserLogins', 'getUserLogins', 'getUserBySisID', 'mergeUserInto', 'getUserLogins', 'updateLogin', 'getUserBySisID', 'getUserLogins'],
            array_column($this->Client->calls, 0)
        );
        $this->assertEquals(['updateLogin', '1', '901', ['sis_user_id' => '']], $this->Client->firstCall('updateLogin'));

        // the outcome note records the plan
        $this->assertStringContainsString('Merged Canvas user 5001 into 5002', $note);
        $this->assertStringContainsString('sign-in login 902', $note);
        $this->assertStringContainsString('clear SIS ID from login 901 (jdoe2)', $note);
    }

    public function testSignInLoginComesFromTheSourceUser()
    {
        // the survivor's own Canvas login has an old address; the email
        // Slate signs in with lives on the retired duplicate's login
        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe.old@example.org', 'jdoe');
        $this->Client->addLogin(static::SOURCE, '901', 'jdoe@example.org', null);

        $note = $this->converge();

        $this->assertConverged('901');
        $this->assertStringContainsString('sign-in login 901', $note);

        // the username is freed from 902 before 901 claims it -- the fake
        // (like Canvas) would have rejected the reverse order
        $writes = $this->Client->writeCalls();
        $this->assertEquals(['updateLogin', '1', '902', ['sis_user_id' => '']], $writes[1]);
        $this->assertEquals(['updateLogin', '1', '901', ['sis_user_id' => 'jdoe']], $writes[2]);
    }

    public function testStaleSisIDOnANonSignInLoginIsClearedBeforeStamping()
    {
        // the sign-in login was never stamped; the username is held by the
        // other login, and a third login carries a stale SIS ID of its own
        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe@example.org', null);
        $this->Client->addLogin(static::SOURCE, '901', 'jd@example.org', 'jdoe');
        $this->Client->addLogin(static::SOURCE, '903', 'jdoe@students.example.org', 'jdoe-legacy');

        $this->converge();

        $this->assertConverged('902');

        $updates = array_values(array_filter($this->Client->writeCalls(), fn ($call) => $call[0] === 'updateLogin'));
        $this->assertCount(3, $updates);
        $this->assertEquals(['sis_user_id' => ''], $updates[0][3]);
        $this->assertEquals(['sis_user_id' => ''], $updates[1][3]);
        $this->assertEquals(['901', '903'], [$updates[0][2], $updates[1][2]]);
        $this->assertEquals(['updateLogin', '1', '902', ['sis_user_id' => 'jdoe']], $updates[2]);
    }

    public function testUnreachableEndStateFailsBeforeMerging()
    {
        // no login carries the primary email, and none carries the username
        // (as SIS ID or login ID) to be renamed to it
        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe.old@example.org', 'jdoe-old');
        $this->Client->addLogin(static::SOURCE, '901', 'john.doe@example.org', 'jdoe2');

        $message = $this->convergeExpectingFailure();

        $this->assertStringContainsString('jdoe@example.org', $message);
        $this->assertStringContainsString('re-execute', $message);
        $this->assertEquals(0, $this->Client->callCount('mergeUserInto'), 'merge_into must not be attempted');
        $this->assertEquals([], $this->Client->writeCalls());
    }

    public function testMissingPrimaryEmailFailsBeforeMerging()
    {
        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe@example.org', 'jdoe');
        $this->Client->addLogin(static::SOURCE, '901', 'john.doe@example.org', 'jdoe2');

        $message = $this->convergeExpectingFailure('');

        $this->assertStringContainsString('no primary email', $message);
        $this->assertEquals([], $this->Client->writeCalls());
    }

    public function testUsernameHeldByAnotherCanvasUserFailsBeforeMerging()
    {
        $this->Client->addUser('5003');
        $this->Client->addLogin('5003', '903', 'someone.else@example.org', 'jdoe');
        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe@example.org', null);
        $this->Client->addLogin(static::SOURCE, '901', 'john.doe@example.org', null);

        $message = $this->convergeExpectingFailure();

        $this->assertStringContainsString('5003', $message);
        $this->assertEquals([], $this->Client->writeCalls());
    }

    public function testLoginCarryingTheUsernameIsRenamedToThePrimaryEmail()
    {
        // an older tenant whose SIS login uses the username as its login ID
        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe', 'jdoe');
        $this->Client->addLogin(static::SOURCE, '901', 'john.doe@example.org', 'jdoe2');

        $note = $this->converge();

        $this->assertConverged('902');
        $this->assertEquals('jdoe@example.org', $this->Client->logins['902']['unique_id']);
        $this->assertStringContainsString('renamed to jdoe@example.org', $note);

        // the rename target was checked free before the merge
        $methods = array_column($this->Client->calls, 0);
        $this->assertLessThan(array_search('mergeUserInto', $methods, true), array_search('getUserByLoginID', $methods, true));
    }

    public function testRenameFailsBeforeMergingWhenAnotherCanvasUserHoldsThePrimaryEmail()
    {
        $this->Client->addUser('5003');
        $this->Client->addLogin('5003', '903', 'jdoe@example.org', null, 'active', '2');
        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe', 'jdoe');
        $this->Client->addLogin(static::SOURCE, '901', 'john.doe@example.org', null);

        $message = $this->convergeExpectingFailure();

        $this->assertStringContainsString('5003', $message);
        $this->assertEquals([], $this->Client->writeCalls());
    }

    public function testResumesAfterAFailureFollowingTheMerge()
    {
        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe@example.org', null);
        $this->Client->addLogin(static::SOURCE, '901', 'john.doe@example.org', 'jdoe');

        // Canvas goes down on the first login write, after merge_into
        $this->Client->failOn['updateLogin'] = 1;

        $message = $this->convergeExpectingFailure();
        $this->assertStringContainsString('is merged into 5002', $message);
        $this->assertStringContainsString('Re-execute this action to resume', $message);
        $this->assertStringContainsString('plan:', $message);
        $this->assertEquals(1, $this->Client->callCount('mergeUserInto'));

        // the source now answers as merged away and its logins 404 -- the
        // retry must pick up from there instead of failing its precondition
        $note = $this->converge();

        $this->assertEquals(1, $this->Client->callCount('mergeUserInto'), 'merge_into must not be repeated');
        $this->assertStringContainsString('Resumed', $note);
        $this->assertConverged('902');
    }

    public function testReExecutingACompletedMergeIsAVerifiedNoOp()
    {
        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe@example.org', 'jdoe');
        $this->Client->addLogin(static::SOURCE, '901', 'john.doe@example.org', 'jdoe2');
        $this->converge();

        $this->Client->calls = [];
        $note = $this->converge();

        $this->assertEquals([], $this->Client->writeCalls(), 'a converged survivor needs no writes');
        $this->assertEquals(0, $this->Client->callCount('mergeUserInto'));
        $this->assertEquals(2, $this->Client->callCount('getUserBySisID'), 'still checked and verified');
        $this->assertStringContainsString('no changes made', $note);
        $this->assertConverged('902');
    }

    public function testSourceMergedIntoADifferentUserFailsClearly()
    {
        $this->Client->addUser('5009');
        $this->Client->users[static::SOURCE]['merged_into_user_id'] = '5009';
        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe@example.org', 'jdoe');

        $message = $this->convergeExpectingFailure();

        $this->assertStringContainsString('5009', $message);
        $this->assertStringContainsString('not the expected 5002', $message);
        $this->assertEquals([], $this->Client->writeCalls());
    }

    public function testDestinationAbsentFailsBeforeMerging()
    {
        unset($this->Client->users[static::DESTINATION]);

        $message = $this->convergeExpectingFailure();

        $this->assertStringContainsString('no longer exists', $message);
        $this->assertEquals([], $this->Client->writeCalls());
    }

    public function testEmailComparisonIsCaseInsensitiveAndTrimmed()
    {
        $this->Client->addLogin(static::DESTINATION, '902', ' JDoe@Example.ORG', 'jdoe');
        $this->Client->addLogin(static::SOURCE, '901', 'john.doe@example.org', null);

        $this->converge(' jdoe@EXAMPLE.org ');

        // matched as-is: no rename, no stamp, nothing to clear
        $this->assertEquals(1, $this->Client->callCount('mergeUserInto'));
        $this->assertEquals(0, $this->Client->callCount('updateLogin'));
        $this->assertConverged('902');
    }

    public function testVerificationFailsAfterMergeWhenTheSisLookupDoesNotResolve()
    {
        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe@example.org', 'jdoe');
        $this->Client->addLogin(static::SOURCE, '901', 'john.doe@example.org', null);
        $this->Client->breakSisLookup = true;

        $message = $this->convergeExpectingFailure();

        $this->assertStringContainsString('Verification failed', $message);
        $this->assertStringContainsString('Re-execute this action to resume', $message);
        $this->assertEquals(1, $this->Client->callCount('mergeUserInto'));
    }

    public function testConnectorSyncRunsInPretendModeAndItsErrorsFailVerification()
    {
        UserMergeExecutor::$connectorClass = FakeCanvasConnector::class;
        $Survivor = new Student();

        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe@example.org', 'jdoe');
        $this->Client->addLogin(static::SOURCE, '901', 'john.doe@example.org', null);

        $this->converge(self::EMAIL, $Survivor);

        $this->assertCount(1, FakeCanvasConnector::$pushUserCalls);
        $this->assertSame($Survivor, FakeCanvasConnector::$pushUserCalls[0][0]);
        $this->assertTrue(FakeCanvasConnector::$pushUserCalls[0][1], 'the sync must run in pretend mode');

        FakeCanvasConnector::$throwMessage = 'Unexpected: more than one login';
        $message = $this->convergeExpectingFailure(self::EMAIL, $Survivor);

        $this->assertStringContainsString('Verification failed', $message);
        $this->assertStringContainsString('Unexpected: more than one login', $message);
    }

    public function testConnectorSyncWithoutAPretendModeIsNeverCalled()
    {
        UserMergeExecutor::$connectorClass = FakeCanvasConnectorWithoutPretend::class;

        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe@example.org', 'jdoe');
        $this->Client->addLogin(static::SOURCE, '901', 'john.doe@example.org', null);

        $this->converge(self::EMAIL, new Student());

        $this->assertEquals(0, FakeCanvasConnectorWithoutPretend::$pushUserCalls);
    }

    public function testAbsentConnectorSkipsTheSyncCheck()
    {
        UserMergeExecutor::$connectorClass = 'Slate\TestsRW\Connectors\Canvas\NoSuchConnector';

        $this->Client->addLogin(static::DESTINATION, '902', 'jdoe@example.org', 'jdoe');
        $this->Client->addLogin(static::SOURCE, '901', 'john.doe@example.org', null);

        $this->assertStringContainsString('Merged Canvas user', $this->converge(self::EMAIL, new Student()));
    }
}
