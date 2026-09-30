<?php

declare(strict_types=1);

namespace Slate\Connectors\Canvas;

use Exception;
use Emergence\People\Person;
use Psr\Log\NullLogger;
use ReflectionMethod;
use Slate\People\Merge\ActionExecutorInterface;
use Slate\People\Merge\FollowUpAction;
use Throwable;

/**
 * Executes a canvas-user-merge follow-up action: merges the source Slate
 * record's Canvas user into the surviving (target) record's Canvas user,
 * then converges the survivor's logins to the login convergence contract
 * (see LoginConvergencePlan) and verifies the survivor can still sign in.
 * Registered against ActionExecutorRegistry for
 * MergeSupport::ACTION_TYPE_USER_MERGE (see MergeSupport::register()) and run
 * only via the explicit POST /people/merge/actions/<id>/execute endpoint --
 * never automatically.
 *
 * Procedure, in order (per specs/behaviors/person-merge.md#canvas-user-merge-executor
 * and plans/canvas-login-convergence.md):
 *
 *   1. Inspect -- read both Canvas users. A source already merged into the
 *      destination (`merged_into_user_id`) means a previous run got past
 *      merge_into: skip it and resume. Merged into anyone else: fail.
 *   2. Plan -- read the logins the survivor will hold and build the
 *      LoginConvergencePlan, and check no other Canvas user holds the
 *      username as an SIS ID (or the primary email as a login ID, when a
 *      rename is planned). Anything unreachable throws here, before
 *      anything external is written.
 *   3. PUT /users/:id/merge_into/:destination -- the irreversible external
 *      merge, skipped when resuming.
 *   4. Converge -- re-plan from the survivor's live logins and apply: clear
 *      SIS IDs, then rename, then stamp. Never deletes a login.
 *   5. Verify -- the username's SIS-ID lookup resolves to the survivor, an
 *      active login has the primary email as its login ID, exactly one
 *      login carries the username as SIS ID, and (when the real Canvas
 *      connector is composed in) its user sync runs clean in pretend mode.
 *
 * Any step throwing marks the action `failed` with the message captured as
 * the outcome note (see FollowUpActionsRequestHandler::handleExecuteActionRequest);
 * the action stays retryable, and a retry resumes after whatever already
 * happened in Canvas. Success returns a human-readable outcome note
 * recording the plan, and the action is marked `completed`.
 */
class UserMergeExecutor implements ActionExecutorInterface
{
    /**
     * The real Canvas connector package's connector class, whose
     * pushUser($User, $logger, $pretend) sync is run in pretend mode as a
     * final read-only verification when it is composed into the site.
     * Referenced only as a string -- this class must load cleanly without
     * that package -- and configurable so tests can substitute a fake.
     */
    public static string $connectorClass = 'Slate\Connectors\Canvas\Connector';

    protected CanvasClientInterface $Client;

    public function __construct(?CanvasClientInterface $Client = null)
    {
        $this->Client = $Client ?? new CanvasClient();
    }

    public function execute(FollowUpAction $Action): string
    {
        [$sourceUserID, $destinationUserID] = $this->readPayload($Action);

        $Audit = $Action->MergeAudit;
        $Target = $Audit?->TargetPerson;

        if (!$Target instanceof Person) {
            throw new Exception('The surviving Slate person record for this merge could not be loaded');
        }

        $username = $Target::fieldExists('Username') ? trim((string) $Target->getValue('Username')) : '';
        $email = trim((string) $Target->getValue('Email'));

        return $this->converge($sourceUserID, $destinationUserID, $username, $email, $Target);
    }

    /**
     * The whole procedure against plain identity values; execute() resolves
     * them from the action and its merge audit.
     *
     * @param Person|null $Survivor the surviving Slate person, for the
     *                              connector sync dry-run (skipped when null)
     */
    public function converge(string $sourceUserID, string $destinationUserID, string $username, string $email, ?Person $Survivor = null): string
    {
        // 1. inspect
        $alreadyMerged = $this->inspectUsers($sourceUserID, $destinationUserID);

        // 2. plan against the logins the survivor will hold after the merge
        $logins = $this->Client->getUserLogins($destinationUserID);
        if (!$alreadyMerged) {
            $logins = array_merge($logins, $this->Client->getUserLogins($sourceUserID));
        }

        $Plan = LoginConvergencePlan::build($logins, $username, $email);
        $this->checkIdentifiersAreFree($Plan, $username, $email, [$sourceUserID, $destinationUserID]);

        $planNote = sprintf(
            '%s Canvas user %s into %s; plan: %s',
            $alreadyMerged ? 'Resumed after a previous run merged' : 'Merge',
            $sourceUserID,
            $destinationUserID,
            $Plan->describe()
        );

        // 3. the irreversible external merge
        if (!$alreadyMerged) {
            try {
                $this->Client->mergeUserInto($sourceUserID, $destinationUserID);
            } catch (Exception $e) {
                throw new Exception(sprintf(
                    'Canvas merge_into of user %s into %s failed: %s -- %s. Re-execute this action to retry; if Canvas did complete the merge, the retry resumes after it.',
                    $sourceUserID,
                    $destinationUserID,
                    $e->getMessage(),
                    $planNote
                ), 0, $e);
            }
        }

        // 4. + 5. converge and verify, from the survivor's live state
        $step = 'converging logins';

        try {
            $AppliedPlan = LoginConvergencePlan::build($this->Client->getUserLogins($destinationUserID), $username, $email);
            $this->applyPlan($AppliedPlan);

            $step = 'verifying sign-in';
            $this->verify($destinationUserID, $username, $email, $Survivor);
        } catch (Exception $e) {
            throw new Exception(sprintf(
                'Canvas user %s is merged into %s, but %s failed: %s -- %s. Re-execute this action to resume; the merge will not be repeated.',
                $sourceUserID,
                $destinationUserID,
                $step,
                $e->getMessage(),
                $planNote
            ), 0, $e);
        }

        if ($alreadyMerged && !$AppliedPlan->hasWrites()) {
            return sprintf(
                'Canvas user %s was already merged into %s and its logins already converge (%s); no changes made. Verified: sis_user_id:%s resolves to %s, sign-in login %s is active, and exactly one login carries the username.',
                $sourceUserID,
                $destinationUserID,
                $AppliedPlan->describe(),
                $username,
                $destinationUserID,
                $email
            );
        }

        return sprintf(
            '%s. Applied: %s. Verified: sis_user_id:%s resolves to %s, sign-in login %s is active, and exactly one login carries the username.',
            $alreadyMerged
                ? sprintf('Resumed: Canvas user %s was already merged into %s', $sourceUserID, $destinationUserID)
                : sprintf('Merged Canvas user %s into %s', $sourceUserID, $destinationUserID),
            $AppliedPlan->describe(),
            $username,
            $destinationUserID,
            $email
        );
    }

    /**
     * @return array{0: string, 1: string} [sourceUserID, destinationUserID]
     */
    protected function readPayload(FollowUpAction $Action): array
    {
        $payload = $Action->Payload ?? [];

        $sourceUserID = trim((string) ($payload['sourceCanvasUserID'] ?? ''));
        $destinationUserID = trim((string) ($payload['destinationCanvasUserID'] ?? ''));

        if ($sourceUserID === '' || $destinationUserID === '') {
            throw new Exception('Follow-up action payload is missing sourceCanvasUserID/destinationCanvasUserID -- direction is not derivable');
        }

        if ($sourceUserID === $destinationUserID) {
            throw new Exception("Source and destination Canvas user IDs are both $sourceUserID -- direction is not derivable");
        }

        return [$sourceUserID, $destinationUserID];
    }

    /**
     * @return bool whether the source is already merged into the destination
     */
    protected function inspectUsers(string $sourceUserID, string $destinationUserID): bool
    {
        $DestinationUser = $this->Client->getUser($destinationUserID);
        if ($DestinationUser === null) {
            throw new Exception("Destination Canvas user $destinationUserID no longer exists");
        }

        $destinationMergedInto = $this->getMergedIntoID($DestinationUser, $destinationUserID);
        if ($destinationMergedInto !== null) {
            throw new Exception("Destination Canvas user $destinationUserID has itself been merged into Canvas user $destinationMergedInto -- resolve which Canvas user this person should keep before re-executing");
        }

        $SourceUser = $this->Client->getUser($sourceUserID);
        if ($SourceUser === null) {
            throw new Exception("Source Canvas user $sourceUserID no longer exists -- it may have been removed in Canvas");
        }

        $sourceMergedInto = $this->getMergedIntoID($SourceUser, $sourceUserID);
        if ($sourceMergedInto === null) {
            return false;
        }

        if ($sourceMergedInto !== $destinationUserID) {
            throw new Exception("Source Canvas user $sourceUserID is already merged into Canvas user $sourceMergedInto, not the expected $destinationUserID -- nothing was changed; resolve the Canvas side by hand");
        }

        return true;
    }

    /**
     * @param array<string, mixed> $user
     */
    protected function getMergedIntoID(array $user, string $requestedUserID): ?string
    {
        $mergedInto = trim((string) ($user['merged_into_user_id'] ?? ''));
        if ($mergedInto !== '') {
            return $mergedInto;
        }

        // a lookup answered with a different user is also a merged-away alias
        $resolvedID = (string) ($user['id'] ?? '');

        return $resolvedID !== '' && $resolvedID !== $requestedUserID ? $resolvedID : null;
    }

    /**
     * @param string[] $mergingUserIDs
     */
    protected function checkIdentifiersAreFree(LoginConvergencePlan $Plan, string $username, string $email, array $mergingUserIDs): void
    {
        $SisHolder = $this->Client->getUserBySisID($username);
        if ($SisHolder !== null && !in_array((string) ($SisHolder['id'] ?? ''), $mergingUserIDs, true)) {
            throw new Exception(sprintf(
                'SIS ID %s already belongs to Canvas user %s, which is not part of this merge -- resolve that user in Canvas before re-executing',
                $username,
                (string) ($SisHolder['id'] ?? '')
            ));
        }

        if ($Plan->renameTo !== null) {
            $LoginHolder = $this->Client->getUserByLoginID($email);
            if ($LoginHolder !== null && !in_array((string) ($LoginHolder['id'] ?? ''), $mergingUserIDs, true)) {
                throw new Exception(sprintf(
                    'Login ID %s already belongs to Canvas user %s, which is not part of this merge -- resolve that user in Canvas before re-executing',
                    $email,
                    (string) ($LoginHolder['id'] ?? '')
                ));
            }
        }
    }

    /**
     * Frees before claiming: clear every other login's SIS ID, then rename
     * the sign-in login to the primary email, then stamp the username.
     */
    protected function applyPlan(LoginConvergencePlan $Plan): void
    {
        foreach ($Plan->clearLogins as $login) {
            $this->Client->updateLogin(LoginConvergencePlan::getAccountID($login), LoginConvergencePlan::getID($login), ['sis_user_id' => '']);
        }

        $accountID = LoginConvergencePlan::getAccountID($Plan->signInLogin);
        $loginID = LoginConvergencePlan::getID($Plan->signInLogin);

        if ($Plan->renameTo !== null) {
            $this->Client->updateLogin($accountID, $loginID, ['unique_id' => $Plan->renameTo]);
        }

        if ($Plan->stampUsername) {
            $this->Client->updateLogin($accountID, $loginID, ['sis_user_id' => $Plan->username]);
        }
    }

    protected function verify(string $destinationUserID, string $username, string $email, ?Person $Survivor): void
    {
        $Resolved = $this->Client->getUserBySisID($username);
        if ($Resolved === null || (string) ($Resolved['id'] ?? '') !== $destinationUserID) {
            throw new Exception("Verification failed: Canvas sis_user_id:$username does not resolve to user $destinationUserID");
        }

        $logins = $this->Client->getUserLogins($destinationUserID);
        $normalizedEmail = LoginConvergencePlan::normalizeLoginID($email);

        $hasSignInLogin = false;
        $usernameLogins = 0;

        foreach ($logins as $login) {
            if (LoginConvergencePlan::isActive($login) && LoginConvergencePlan::normalizeLoginID(LoginConvergencePlan::getLoginID($login)) === $normalizedEmail) {
                $hasSignInLogin = true;
            }

            if (LoginConvergencePlan::getSisUserID($login) === $username) {
                $usernameLogins++;
            }
        }

        if (!$hasSignInLogin) {
            throw new Exception("Verification failed: no active login on Canvas user $destinationUserID has the primary email $email as its login ID, so sign-in would not resolve to it");
        }

        if ($usernameLogins !== 1) {
            throw new Exception("Verification failed: $usernameLogins logins on Canvas user $destinationUserID carry SIS ID $username, expected exactly 1");
        }

        if ($Survivor instanceof Person) {
            $this->verifyConnectorSync($Survivor);
        }
    }

    /**
     * Runs the real Canvas connector's user sync for the survivor in pretend
     * mode -- the same sync every Canvas launch runs for real -- when that
     * connector is composed into the site. Only called when pushUser()
     * takes a `$pretend` third parameter, so a changed signature is skipped
     * rather than risked in a writing mode.
     */
    protected function verifyConnectorSync(Person $Survivor): void
    {
        $connectorClass = static::$connectorClass;

        if (!class_exists($connectorClass) || !method_exists($connectorClass, 'pushUser')) {
            return;
        }

        $Method = new ReflectionMethod($connectorClass, 'pushUser');
        $parameters = $Method->getParameters();

        if (!$Method->isPublic() || !$Method->isStatic() || count($parameters) < 3 || $parameters[2]->getName() !== 'pretend') {
            return;
        }

        try {
            $Method->invoke(null, $Survivor, new NullLogger(), true);
        } catch (Throwable $e) {
            throw new Exception('Verification failed: the Canvas connector\'s user sync (pretend mode) errored for the surviving person: '.$e->getMessage(), 0, $e);
        }
    }
}
