<?php

declare(strict_types=1);

namespace Slate\Connectors\Canvas;

use Exception;

/**
 * The writes that bring a surviving Canvas user's logins to the login
 * convergence contract (specs/behaviors/person-merge.md#canvas-user-merge-executor):
 *
 *   1. the sign-in login is the active login whose login ID (`unique_id`)
 *      equals the surviving Slate person's primary email, compared
 *      case-insensitively and trimmed;
 *   2. the surviving username is the SIS ID of exactly one login,
 *      preferably the sign-in login;
 *   3. every other login is kept with its SIS ID cleared -- never deleted,
 *      since Canvas keeps a deleted login's SIS ID reserved;
 *   4. IDs are freed before they are claimed, so apply clears, then the
 *      rename, then the stamp.
 *
 * Built from a plain list of Canvas login objects: before merge_into, the
 * union of both users' logins (all of which the merge moves onto the
 * survivor); after it, the survivor's own logins. The same inputs always
 * yield the same plan, and a converged set of logins yields a plan with no
 * writes -- which is what makes UserMergeExecutor resumable and idempotent.
 *
 * Pure: makes no Canvas calls itself.
 */
class LoginConvergencePlan
{
    /**
     * @param array<string, mixed>             $signInLogin   the login that ends up as the sign-in login
     * @param string|null                      $renameTo      the primary email to rename the sign-in login's login ID to, if any
     * @param array<int, array<string, mixed>> $clearLogins   logins whose SIS ID gets cleared
     * @param bool                             $stampUsername whether the sign-in login still needs the username as its SIS ID
     */
    public function __construct(
        public array $signInLogin,
        public ?string $renameTo,
        public array $clearLogins,
        public bool $stampUsername,
        public string $username
    ) {
    }

    /**
     * @param array<int, array<string, mixed>> $logins
     *
     * @throws Exception when the contract's end state is not reachable from
     *                   these logins -- the message says what an
     *                   administrator has to change before retrying
     */
    public static function build(array $logins, string $username, string $email): self
    {
        $username = trim($username);
        $normalizedEmail = static::normalizeLoginID($email);

        if ($username === '') {
            throw new Exception('The surviving Slate person has no username to use as the Canvas SIS ID -- set a username on the surviving person, then re-execute this action');
        }

        if ($normalizedEmail === '') {
            throw new Exception('The surviving Slate person has no primary email, and Canvas sign-in uses the primary email as the login ID -- set a primary email on the surviving person, then re-execute this action');
        }

        $SignInLogin = null;
        $inactiveEmailLogin = null;

        foreach ($logins as $login) {
            if (!static::isWritable($login)) {
                continue;
            }

            if (static::normalizeLoginID(static::getLoginID($login)) !== $normalizedEmail) {
                continue;
            }

            if (!static::isActive($login)) {
                $inactiveEmailLogin = $login;
                continue;
            }

            // with more than one match (logins in different accounts),
            // prefer the one that already carries the username
            if ($SignInLogin === null || (static::getSisUserID($SignInLogin) !== $username && static::getSisUserID($login) === $username)) {
                $SignInLogin = $login;
            }
        }

        $renameTo = null;

        if ($SignInLogin === null) {
            if ($inactiveEmailLogin !== null) {
                throw new Exception(sprintf(
                    'Canvas login %s has the survivor\'s primary email (%s) as its login ID but is not active (%s) -- reactivate it in Canvas, then re-execute this action',
                    static::getID($inactiveEmailLogin),
                    trim($email),
                    (string) ($inactiveEmailLogin['workflow_state'] ?? 'unknown state')
                ));
            }

            $SignInLogin = static::findRenameTarget($logins, $username);

            if ($SignInLogin === null) {
                throw new Exception(sprintf(
                    'No Canvas login being merged has the survivor\'s primary email (%s) as its login ID, and none carries the survivor\'s username (%s) to rename -- change the surviving person\'s primary email in Slate to their Canvas login ID, or set the login ID in Canvas, then re-execute this action',
                    trim($email),
                    $username
                ));
            }

            $renameTo = trim($email);
        }

        $clearLogins = [];

        foreach ($logins as $login) {
            if (static::getID($login) === static::getID($SignInLogin)) {
                continue;
            }

            if (static::getSisUserID($login) === '') {
                continue;
            }

            if (!static::isWritable($login)) {
                throw new Exception(sprintf('Canvas login %s carries SIS ID %s but has no account ID to clear it through', static::getID($login), static::getSisUserID($login)));
            }

            $clearLogins[] = $login;
        }

        return new self(
            $SignInLogin,
            $renameTo,
            $clearLogins,
            static::getSisUserID($SignInLogin) !== $username,
            $username
        );
    }

    public function hasWrites(): bool
    {
        return $this->renameTo !== null || $this->stampUsername || count($this->clearLogins) > 0;
    }

    /**
     * One-line summary of the plan for an outcome note.
     */
    public function describe(): string
    {
        $parts = [sprintf(
            'sign-in login %s (%s)',
            static::getID($this->signInLogin),
            $this->renameTo !== null
                ? sprintf('login ID %s renamed to %s', static::getLoginID($this->signInLogin), $this->renameTo)
                : static::getLoginID($this->signInLogin)
        )];

        if (count($this->clearLogins) > 0) {
            $parts[] = 'clear SIS ID from '.implode(', ', array_map(
                fn (array $login) => sprintf('login %s (%s)', static::getID($login), static::getSisUserID($login)),
                $this->clearLogins
            ));
        }

        $parts[] = $this->stampUsername
            ? sprintf('stamp SIS ID %s on the sign-in login', $this->username)
            : sprintf('SIS ID %s already on the sign-in login', $this->username);

        return implode('; ', $parts);
    }

    public static function normalizeLoginID(string $loginID): string
    {
        return strtolower(trim($loginID));
    }

    /**
     * @param array<string, mixed> $login
     */
    public static function isActive(array $login): bool
    {
        $state = $login['workflow_state'] ?? null;

        return $state === null || $state === 'active';
    }

    /**
     * @param array<string, mixed> $login
     */
    public static function getID(array $login): string
    {
        return (string) ($login['id'] ?? '');
    }

    /**
     * @param array<string, mixed> $login
     */
    public static function getAccountID(array $login): string
    {
        return (string) ($login['account_id'] ?? '');
    }

    /**
     * @param array<string, mixed> $login
     */
    public static function getLoginID(array $login): string
    {
        return (string) ($login['unique_id'] ?? '');
    }

    /**
     * @param array<string, mixed> $login
     */
    public static function getSisUserID(array $login): string
    {
        return isset($login['sis_user_id']) ? trim((string) $login['sis_user_id']) : '';
    }

    /**
     * @param array<string, mixed> $login
     */
    protected static function isWritable(array $login): bool
    {
        return static::getID($login) !== '' && static::getAccountID($login) !== '';
    }

    /**
     * A login that can safely become the sign-in login by renaming its
     * login ID to the primary email: one that already is the survivor's
     * SIS login, or failing that one whose login ID is the username.
     *
     * @param array<int, array<string, mixed>> $logins
     *
     * @return array<string, mixed>|null
     */
    protected static function findRenameTarget(array $logins, string $username): ?array
    {
        $candidates = array_values(array_filter($logins, fn (array $login) => static::isWritable($login) && static::isActive($login)));

        foreach ($candidates as $login) {
            if (static::getSisUserID($login) === $username) {
                return $login;
            }
        }

        foreach ($candidates as $login) {
            if (static::normalizeLoginID(static::getLoginID($login)) === static::normalizeLoginID($username)) {
                return $login;
            }
        }

        return null;
    }
}
