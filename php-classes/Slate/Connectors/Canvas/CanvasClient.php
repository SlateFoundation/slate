<?php

declare(strict_types=1);

namespace Slate\Connectors\Canvas;

use RemoteSystems\Canvas;
use RemoteSystems\CanvasApiException;

/**
 * Default CanvasClientInterface implementation: a thin wrapper over
 * RemoteSystems\Canvas that turns its 404 CanvasApiException into a null
 * return for the two lookup methods (so callers can tell "doesn't exist"
 * apart from a real API failure without catching exceptions themselves),
 * and lets every other status code propagate as-is.
 */
class CanvasClient implements CanvasClientInterface
{
    public function getUser(string $userID): ?array
    {
        return $this->nullOn404(fn () => Canvas::getUser($userID));
    }

    public function getUserBySisID(string $sisUserID): ?array
    {
        return $this->nullOn404(fn () => Canvas::getUserBySisID($sisUserID));
    }

    public function mergeUserInto(string $sourceUserID, string $destinationUserID): array
    {
        return Canvas::mergeUserInto($sourceUserID, $destinationUserID);
    }

    public function getUserLogins(string $userID): array
    {
        return Canvas::getUserLogins($userID);
    }

    public function updateLogin(string $accountID, string $loginID, array $data): array
    {
        return Canvas::updateLogin($accountID, $loginID, $data);
    }

    /**
     * @param callable(): array<string, mixed> $call
     *
     * @return array<string, mixed>|null
     */
    protected function nullOn404(callable $call): ?array
    {
        try {
            return $call();
        } catch (CanvasApiException $e) {
            if ($e->getCode() === 404) {
                return null;
            }

            throw $e;
        }
    }
}
