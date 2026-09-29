<?php

namespace Slate\TestsRW\Connectors\Canvas;

use Slate\Connectors\Canvas\CanvasApiException;
use Slate\Connectors\Canvas\CanvasClientInterface;

/**
 * In-memory CanvasClientInterface test double shaped like a real Canvas
 * tenant, plus a call log so tests can assert both *what*
 * UserMergeExecutor decided (return value / thrown exception) and *how* it
 * got there (which calls it made, in what order, and which it skipped).
 *
 * It simulates the Canvas behavior the executor depends on, rather than
 * returning canned answers:
 *
 * - login IDs (`unique_id`) are whatever the fixture says -- in a real
 *   tenant, email addresses, NOT Slate usernames;
 * - merge_into moves every login of the source onto the destination and
 *   leaves the source resolvable by ID with `merged_into_user_id` set,
 *   while its logins endpoint 404s;
 * - SIS IDs are unique across the tenant and login IDs are unique
 *   (case-insensitively) per account, so a write that claims an ID before
 *   the login holding it has freed it is rejected, as Canvas rejects it;
 * - the SIS-ID and login-ID lookups resolve through the logins.
 *
 * Failures can be injected per method via $failOn.
 */
class FakeCanvasClient implements CanvasClientInterface
{
    /** @var array<string, array<string, mixed>> Canvas users by ID */
    public array $users = [];

    /** @var array<string, array<string, mixed>> Canvas logins by login ID, each carrying its user_id */
    public array $logins = [];

    /** @var array<string, int> method name => which call to it (1-based) throws a simulated outage */
    public array $failOn = [];

    /** when true, the SIS-ID lookup never resolves (simulates a lookup outage/misconfiguration) */
    public bool $breakSisLookup = false;

    /** @var array<int, array<int, mixed>> */
    public array $calls = [];

    public function addUser(string $userID): void
    {
        $this->users[$userID] = ['id' => $userID, 'name' => "Canvas user $userID"];
    }

    public function addLogin(string $userID, string $loginID, string $uniqueID, ?string $sisUserID = null, string $workflowState = 'active', string $accountID = '1'): void
    {
        $this->logins[$loginID] = [
            'id' => $loginID,
            'user_id' => $userID,
            'account_id' => $accountID,
            'unique_id' => $uniqueID,
            'sis_user_id' => $sisUserID,
            'workflow_state' => $workflowState,
        ];
    }

    public function getUser(string $userID): ?array
    {
        $this->recordCall('getUser', $userID);

        return $this->users[$userID] ?? null;
    }

    public function getUserBySisID(string $sisUserID): ?array
    {
        $this->recordCall('getUserBySisID', $sisUserID);

        if ($this->breakSisLookup) {
            return null;
        }

        foreach ($this->logins as $login) {
            if ($login['sis_user_id'] !== null && $login['sis_user_id'] !== '' && $login['sis_user_id'] === $sisUserID) {
                return $this->users[$login['user_id']] ?? null;
            }
        }

        return null;
    }

    public function getUserByLoginID(string $loginID): ?array
    {
        $this->recordCall('getUserByLoginID', $loginID);

        foreach ($this->logins as $login) {
            if (strtolower($login['unique_id']) === strtolower($loginID)) {
                return $this->users[$login['user_id']] ?? null;
            }
        }

        return null;
    }

    public function mergeUserInto(string $sourceUserID, string $destinationUserID): array
    {
        $this->recordCall('mergeUserInto', $sourceUserID, $destinationUserID);

        if (!isset($this->users[$sourceUserID], $this->users[$destinationUserID])) {
            throw new CanvasApiException("Canvas API request to \"users/$sourceUserID/merge_into/$destinationUserID\" returned HTTP 404", 404);
        }

        foreach ($this->logins as $loginID => $login) {
            if ($login['user_id'] === $sourceUserID) {
                $this->logins[$loginID]['user_id'] = $destinationUserID;
            }
        }

        $this->users[$sourceUserID]['merged_into_user_id'] = $destinationUserID;

        return $this->users[$destinationUserID];
    }

    public function getUserLogins(string $userID): array
    {
        $this->recordCall('getUserLogins', $userID);

        if (!isset($this->users[$userID]) || !empty($this->users[$userID]['merged_into_user_id'])) {
            throw new CanvasApiException("Canvas API request to \"users/$userID/logins\" returned HTTP 404", 404);
        }

        return $this->loginsOf($userID);
    }

    public function updateLogin(string $accountID, string $loginID, array $data): array
    {
        $this->recordCall('updateLogin', $accountID, $loginID, $data);

        if (!isset($this->logins[$loginID]) || $this->logins[$loginID]['account_id'] !== $accountID) {
            throw new CanvasApiException("Canvas API request to \"accounts/$accountID/logins/$loginID\" returned HTTP 404", 404);
        }

        foreach ($this->logins as $otherID => $other) {
            if ($otherID === $loginID) {
                continue;
            }

            if (isset($data['sis_user_id']) && $data['sis_user_id'] !== '' && $other['sis_user_id'] === $data['sis_user_id']) {
                throw new CanvasApiException("Canvas API request to \"accounts/$accountID/logins/$loginID\" returned HTTP 400: SIS ID \"{$data['sis_user_id']}\" is already in use", 400);
            }

            if (isset($data['unique_id']) && $other['account_id'] === $accountID && strtolower($other['unique_id']) === strtolower($data['unique_id'])) {
                throw new CanvasApiException("Canvas API request to \"accounts/$accountID/logins/$loginID\" returned HTTP 400: login ID \"{$data['unique_id']}\" is already in use", 400);
            }
        }

        foreach ($data as $field => $value) {
            $this->logins[$loginID][$field] = $field === 'sis_user_id' && $value === '' ? null : $value;
        }

        return $this->logins[$loginID];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function loginsOf(string $userID): array
    {
        return array_values(array_filter($this->logins, fn ($login) => $login['user_id'] === $userID));
    }

    public function callCount(string $method): int
    {
        return count(array_filter($this->calls, fn ($call) => $call[0] === $method));
    }

    /**
     * @return array<int, array<int, mixed>> every call that changes Canvas state
     */
    public function writeCalls(): array
    {
        return array_values(array_filter($this->calls, fn ($call) => in_array($call[0], ['mergeUserInto', 'updateLogin'], true)));
    }

    /**
     * @return array<int, mixed>|null
     */
    public function firstCall(string $method): ?array
    {
        foreach ($this->calls as $call) {
            if ($call[0] === $method) {
                return $call;
            }
        }

        return null;
    }

    protected function recordCall(string $method, mixed ...$args): void
    {
        $this->calls[] = array_merge([$method], $args);

        if (isset($this->failOn[$method]) && --$this->failOn[$method] === 0) {
            unset($this->failOn[$method]);
            throw new CanvasApiException("simulated Canvas outage during $method", 500);
        }
    }
}
