<?php

declare(strict_types=1);

namespace Slate\Connectors\Canvas;

use Exception;
use Emergence\People\Person;
use Slate\People\Merge\ActionExecutorInterface;
use Slate\People\Merge\FollowUpAction;

/**
 * Executes a canvas-user-merge follow-up action: merges the source Slate
 * record's Canvas user into the surviving (target) record's Canvas user,
 * then normalizes the survivor's SIS identity and verifies it resolves
 * correctly. Registered against ActionExecutorRegistry for
 * MergeSupport::ACTION_TYPE_USER_MERGE (see MergeSupport::register()) and run
 * only via the explicit POST /people/merge/actions/<id>/execute endpoint --
 * never automatically.
 *
 * Procedure, in order (per specs/behaviors/person-merge.md and
 * plans/canvas-merge-executor.md):
 *
 *   1. Precondition checks -- both Canvas users exist, direction is still
 *      derivable from the payload, the source isn't already merged. Any
 *      failure here throws before anything external is called.
 *   2. PUT /users/:id/merge_into/:destination -- the irreversible external
 *      merge.
 *   3. Normalize SIS identity -- list the survivor's logins, clear a stale
 *      sis_user_id the moved login dragged over, and (re)stamp the
 *      survivor's own login with the surviving Slate username.
 *   4. Verify -- GET /users/sis_user_id:<username> resolves to the
 *      destination user.
 *
 * Any step throwing marks the action `failed` with the message captured as
 * the outcome note (see FollowUpActionsRequestHandler::handleExecuteActionRequest);
 * the action stays retryable. Success returns a human-readable outcome note
 * and the action is marked `completed`.
 */
class UserMergeExecutor implements ActionExecutorInterface
{
    protected CanvasClientInterface $Client;

    public function __construct(?CanvasClientInterface $Client = null)
    {
        $this->Client = $Client ?? new CanvasClient();
    }

    public function execute(FollowUpAction $Action): string
    {
        [$sourceUserID, $destinationUserID, $username] = $this->checkPreconditions($Action);

        $this->Client->mergeUserInto($sourceUserID, $destinationUserID);

        $this->normalizeSisIdentity($destinationUserID, $username);

        $Verified = $this->Client->getUserBySisID($username);
        if ($Verified === null || (string) ($Verified['id'] ?? '') !== $destinationUserID) {
            throw new Exception("Verification failed: Canvas sis_user_id:$username does not resolve to user $destinationUserID after the merge");
        }

        return sprintf(
            'Merged Canvas user %s into %s; verified sis_user_id:%s resolves to the survivor.',
            $sourceUserID,
            $destinationUserID,
            $username
        );
    }

    /**
     * @return array{0: string, 1: string, 2: string} [sourceUserID, destinationUserID, survivorUsername]
     */
    protected function checkPreconditions(FollowUpAction $Action): array
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

        $Audit = $Action->MergeAudit;
        $Target = $Audit?->TargetPerson;

        if (!$Target instanceof Person) {
            throw new Exception('The surviving Slate person record for this merge could not be loaded');
        }

        if (!$Target::fieldExists('Username')) {
            throw new Exception('The surviving Slate record has no Username field to normalize the Canvas SIS identity against');
        }

        $username = trim((string) $Target->getValue('Username'));
        if ($username === '') {
            throw new Exception('The surviving Slate record has no username to normalize the Canvas SIS identity against');
        }

        $DestinationUser = $this->Client->getUser($destinationUserID);
        if ($DestinationUser === null) {
            throw new Exception("Destination Canvas user $destinationUserID no longer exists");
        }

        $SourceUser = $this->Client->getUser($sourceUserID);
        if ($SourceUser === null) {
            throw new Exception("Source Canvas user $sourceUserID no longer exists -- it may already have been merged or removed");
        }

        if ((string) ($SourceUser['id'] ?? '') !== $sourceUserID) {
            throw new Exception("Source Canvas user $sourceUserID already resolves to a different user -- it appears to already be merged");
        }

        return [$sourceUserID, $destinationUserID, $username];
    }

    /**
     * Clears any sis_user_id the merge_into call dragged onto the
     * survivor's logins that doesn't match the surviving Slate username,
     * then ensures the survivor's own login (the one whose unique_id is
     * the surviving username) carries that username as its sis_user_id.
     */
    protected function normalizeSisIdentity(string $destinationUserID, string $username): void
    {
        $logins = $this->Client->getUserLogins($destinationUserID);

        $HomeLogin = null;
        $alreadyCorrect = false;

        foreach ($logins as $login) {
            $accountID = (string) ($login['account_id'] ?? '');
            $loginID = (string) ($login['id'] ?? '');
            $sisUserID = array_key_exists('sis_user_id', $login) && $login['sis_user_id'] !== null ? (string) $login['sis_user_id'] : '';
            $uniqueID = (string) ($login['unique_id'] ?? '');

            if ($sisUserID === $username) {
                $alreadyCorrect = true;
            } elseif ($sisUserID !== '' && $accountID !== '' && $loginID !== '') {
                // a stale sis_user_id dragged over by the merge -- clear it
                // so it doesn't shadow the survivor's real SIS identity
                $this->Client->updateLogin($accountID, $loginID, ['sis_user_id' => '']);
            }

            if ($HomeLogin === null && $uniqueID === $username && $accountID !== '' && $loginID !== '') {
                $HomeLogin = $login;
            }
        }

        if ($alreadyCorrect) {
            return;
        }

        if ($HomeLogin === null) {
            throw new Exception("No Canvas login on user $destinationUserID matches the survivor's username ($username) to (re)stamp its SIS identity");
        }

        $this->Client->updateLogin((string) $HomeLogin['account_id'], (string) $HomeLogin['id'], ['sis_user_id' => $username]);
    }
}
