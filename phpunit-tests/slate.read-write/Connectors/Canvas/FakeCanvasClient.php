<?php

namespace Slate\TestsRW\Connectors\Canvas;

use RemoteSystems\CanvasApiException;
use Slate\Connectors\Canvas\CanvasClientInterface;

/**
 * In-memory CanvasClientInterface test double: canned responses keyed by
 * ID, plus a call log so tests can assert both *what* UserMergeExecutor
 * decided (return value / thrown exception) and *how* it got there (which
 * calls it made, in what order, and which it skipped).
 */
class FakeCanvasClient implements CanvasClientInterface
{
    /** @var array<string, array<string, mixed>> */
    public array $users = [];

    /** @var array<string, array<string, mixed>> */
    public array $usersBySisID = [];

    /** @var array<string, array<int, array<string, mixed>>> */
    public array $logins = [];

    public bool $failMergeInto = false;

    /** @var array<int, array<int, mixed>> */
    public array $calls = [];

    public function getUser(string $userID): ?array
    {
        $this->calls[] = ['getUser', $userID];

        return $this->users[$userID] ?? null;
    }

    public function getUserBySisID(string $sisUserID): ?array
    {
        $this->calls[] = ['getUserBySisID', $sisUserID];

        return $this->usersBySisID[$sisUserID] ?? null;
    }

    public function mergeUserInto(string $sourceUserID, string $destinationUserID): array
    {
        $this->calls[] = ['mergeUserInto', $sourceUserID, $destinationUserID];

        if ($this->failMergeInto) {
            throw new CanvasApiException("simulated failure merging $sourceUserID into $destinationUserID", 500);
        }

        return ['id' => $destinationUserID];
    }

    public function getUserLogins(string $userID): array
    {
        $this->calls[] = ['getUserLogins', $userID];

        return $this->logins[$userID] ?? [];
    }

    public function updateLogin(string $accountID, string $loginID, array $data): array
    {
        $this->calls[] = ['updateLogin', $accountID, $loginID, $data];

        return array_merge(['id' => $loginID, 'account_id' => $accountID], $data);
    }

    public function callCount(string $method): int
    {
        return count(array_filter($this->calls, fn ($call) => $call[0] === $method));
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
}
