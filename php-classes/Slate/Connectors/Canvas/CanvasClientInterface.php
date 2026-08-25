<?php

declare(strict_types=1);

namespace Slate\Connectors\Canvas;

use RemoteSystems\CanvasApiException;

/**
 * The seam UserMergeExecutor calls through for every Canvas REST request it
 * needs. CanvasClient is the real implementation (thin wrapper over
 * RemoteSystems\Canvas); tests substitute a fake implementing this same
 * interface so the executor's procedure can be verified without a live
 * Canvas API.
 */
interface CanvasClientInterface
{
    /**
     * @return array<string, mixed>|null null when Canvas returns 404 (the
     *                                    user doesn't exist)
     *
     * @throws CanvasApiException on any other error response
     */
    public function getUser(string $userID): ?array;

    /**
     * @return array<string, mixed>|null null when Canvas returns 404 (no
     *                                    user with this SIS ID)
     *
     * @throws CanvasApiException on any other error response
     */
    public function getUserBySisID(string $sisUserID): ?array;

    /**
     * @return array<string, mixed>
     *
     * @throws CanvasApiException on any error response
     */
    public function mergeUserInto(string $sourceUserID, string $destinationUserID): array;

    /**
     * @return array<int, array<string, mixed>>
     *
     * @throws CanvasApiException on any error response
     */
    public function getUserLogins(string $userID): array;

    /**
     * @param array<string, mixed> $data
     *
     * @return array<string, mixed>
     *
     * @throws CanvasApiException on any error response
     */
    public function updateLogin(string $accountID, string $loginID, array $data): array;
}
