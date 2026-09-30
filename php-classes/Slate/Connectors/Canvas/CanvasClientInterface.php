<?php

declare(strict_types=1);

namespace Slate\Connectors\Canvas;

/**
 * The seam UserMergeExecutor calls through for every Canvas REST request it
 * needs. CanvasClient is the real implementation (builds the REST calls
 * itself, configured off the real RemoteSystems\Canvas connector package
 * when one is composed into the site -- see its docblock); tests
 * substitute a fake implementing this same interface so the executor's
 * procedure can be verified without a live Canvas API.
 */
interface CanvasClientInterface
{
    /**
     * A user merged away by merge_into still resolves here, carrying the
     * surviving user's ID as `merged_into_user_id`.
     *
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
     * Looks up the Canvas user holding a login whose login ID (Canvas's
     * `unique_id`, e.g. an email address) is the given value.
     *
     * @return array<string, mixed>|null null when Canvas returns 404 (no
     *                                    user holds this login ID)
     *
     * @throws CanvasApiException on any other error response
     */
    public function getUserByLoginID(string $loginID): ?array;

    /**
     * @return array<string, mixed>
     *
     * @throws CanvasApiException on any error response
     */
    public function mergeUserInto(string $sourceUserID, string $destinationUserID): array;

    /**
     * @return array<int, array<string, mixed>>
     *
     * @throws CanvasApiException on any error response -- including a 404
     *                            for a user merged away by merge_into
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
