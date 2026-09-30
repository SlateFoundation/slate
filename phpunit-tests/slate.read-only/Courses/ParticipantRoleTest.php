<?php

namespace Slate\TestsRO\Courses;

use Slate\Courses\ParticipantRole;
use Slate\Courses\SectionParticipant;

/**
 * Covers the role rank in specs/behaviors/section-enrollment-import.md:
 * every ordered pair of roles, plus missing and unranked roles. Pure: no
 * database needed.
 *
 * The expected tables are written out by hand rather than derived from
 * ParticipantRole::RANKED, so a reordering of RANKED fails here.
 */
class ParticipantRoleTest extends \PHPUnit_Framework_TestCase
{
    public function testRankedLowestToHighest()
    {
        $this->assertSame(['Observer', 'Student', 'Assistant', 'Teacher'], ParticipantRole::RANKED);

        $this->assertSame(0, ParticipantRole::getRank('Observer'));
        $this->assertSame(1, ParticipantRole::getRank('Student'));
        $this->assertSame(2, ParticipantRole::getRank('Assistant'));
        $this->assertSame(3, ParticipantRole::getRank('Teacher'));
    }

    public function testUnrankedRoleHasNoRank()
    {
        $this->assertNull(ParticipantRole::getRank('Principal'));
        $this->assertNull(ParticipantRole::getRank(''));
        $this->assertNull(ParticipantRole::getRank('student'), 'rank lookup is case-sensitive, like the enum');
    }

    public function testSectionParticipantRoleEnumIsTheRankedList()
    {
        $this->assertSame(ParticipantRole::RANKED, SectionParticipant::$fields['Role']['values']);
    }

    public function testOutranksEveryPair()
    {
        // [role, otherRole, role outranks otherRole]
        $pairs = [
            ['Observer', 'Observer', false],
            ['Observer', 'Student', false],
            ['Observer', 'Assistant', false],
            ['Observer', 'Teacher', false],

            ['Student', 'Observer', true],
            ['Student', 'Student', false],
            ['Student', 'Assistant', false],
            ['Student', 'Teacher', false],

            ['Assistant', 'Observer', true],
            ['Assistant', 'Student', true],
            ['Assistant', 'Assistant', false],
            ['Assistant', 'Teacher', false],

            ['Teacher', 'Observer', true],
            ['Teacher', 'Student', true],
            ['Teacher', 'Assistant', true],
            ['Teacher', 'Teacher', false],
        ];

        $this->assertCount(count(ParticipantRole::RANKED) ** 2, $pairs, 'every ordered pair is listed');

        foreach ($pairs as [$role, $otherRole, $expected]) {
            $this->assertSame(
                $expected,
                ParticipantRole::outranks($role, $otherRole),
                sprintf('%s outranks %s', $role, $otherRole)
            );
        }
    }

    public function testOutranksWithMissingOrUnrankedRole()
    {
        foreach (ParticipantRole::RANKED as $role) {
            $this->assertFalse(ParticipantRole::outranks(null, $role), "null outranks $role");
            $this->assertFalse(ParticipantRole::outranks($role, null), "$role outranks null");
            $this->assertFalse(ParticipantRole::outranks('Principal', $role), "Principal outranks $role");
            $this->assertFalse(ParticipantRole::outranks($role, 'Principal'), "$role outranks Principal");
        }

        $this->assertFalse(ParticipantRole::outranks(null, null));
    }

    public function testResolveImportedEveryPair()
    {
        // [existing role, imported role, resulting role]
        $pairs = [
            ['Observer', 'Observer', 'Observer'],
            ['Observer', 'Student', 'Student'],
            ['Observer', 'Assistant', 'Assistant'],
            ['Observer', 'Teacher', 'Teacher'],

            ['Student', 'Observer', 'Student'],
            ['Student', 'Student', 'Student'],
            ['Student', 'Assistant', 'Assistant'],
            ['Student', 'Teacher', 'Teacher'],

            ['Assistant', 'Observer', 'Assistant'],
            ['Assistant', 'Student', 'Assistant'],
            ['Assistant', 'Assistant', 'Assistant'],
            ['Assistant', 'Teacher', 'Teacher'],

            ['Teacher', 'Observer', 'Teacher'],
            ['Teacher', 'Student', 'Teacher'],
            ['Teacher', 'Assistant', 'Teacher'],
            ['Teacher', 'Teacher', 'Teacher'],
        ];

        $this->assertCount(count(ParticipantRole::RANKED) ** 2, $pairs, 'every ordered pair is listed');

        foreach ($pairs as [$existingRole, $importedRole, $expected]) {
            $this->assertSame(
                $expected,
                ParticipantRole::resolveImported($existingRole, $importedRole),
                sprintf('existing %s, imported %s', $existingRole, $importedRole)
            );
        }
    }

    public function testResolveImportedForNewParticipantTakesImportedRole()
    {
        foreach (ParticipantRole::RANKED as $role) {
            $this->assertSame($role, ParticipantRole::resolveImported(null, $role));
        }
    }

    public function testResolveImportedWithUnrankedRoleTakesImportedRole()
    {
        // an unranked role is handled as imports always have: the row's role applies
        $this->assertSame('Student', ParticipantRole::resolveImported('Principal', 'Student'));
        $this->assertSame('Principal', ParticipantRole::resolveImported('Teacher', 'Principal'));
    }
}
