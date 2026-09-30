<?php

namespace Slate\Courses;

/**
 * The roles a person can hold in a course section, and how they rank.
 *
 * SectionParticipant's Role enum is declared from RANKED, so the list of
 * roles and their rank cannot drift apart. See
 * specs/behaviors/section-enrollment-import.md.
 */
class ParticipantRole
{
    public const OBSERVER = 'Observer';
    public const STUDENT = 'Student';
    public const ASSISTANT = 'Assistant';
    public const TEACHER = 'Teacher';

    /**
     * Every role, lowest rank first
     */
    public const RANKED = [
        self::OBSERVER,
        self::STUDENT,
        self::ASSISTANT,
        self::TEACHER,
    ];

    /**
     * The rank of a role (0 is lowest), or null for a role not in RANKED
     */
    public static function getRank(string $role): ?int
    {
        $rank = array_search($role, self::RANKED, true);

        if ($rank === false) {
            return null;
        }

        return $rank;
    }

    /**
     * Whether $role ranks above $otherRole. A missing or unranked role
     * neither outranks nor is outranked.
     */
    public static function outranks(?string $role, ?string $otherRole): bool
    {
        if ($role === null || $otherRole === null) {
            return false;
        }

        $rank = static::getRank($role);
        $otherRank = static::getRank($otherRole);

        if ($rank === null || $otherRank === null) {
            return false;
        }

        return $rank > $otherRank;
    }

    /**
     * The role a participant holds after an import sets $importedRole on
     * them: an import never lowers a role, so an existing role that
     * outranks the imported one is kept.
     *
     * @param ?string $existingRole null when the person is not yet a participant
     */
    public static function resolveImported(?string $existingRole, string $importedRole): string
    {
        if ($existingRole !== null && static::outranks($existingRole, $importedRole)) {
            return $existingRole;
        }

        return $importedRole;
    }
}
