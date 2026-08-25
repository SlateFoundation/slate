<?php

declare(strict_types=1);

namespace Slate\People\Merge\Detectors;

use DB;
use Emergence\People\Person;

/**
 * Matches two people carrying an identical, non-empty Student Number.
 * StudentNumber is declared unique in Slate\People\Student::$fields, so a
 * live duplicate here means the constraint was bypassed (legacy import,
 * direct DB write, a pre-constraint-era row) rather than something this
 * detector is racing to catch going forward -- still worth surfacing for
 * cleanup, and the strongest signal of the initial detector set.
 *
 * @see specs/behaviors/person-merge.md#duplicate-candidates
 */
class IdenticalStudentNumberDetector extends AbstractDetector
{
    public const SLUG = 'identical-student-number';
    protected const SCORE = 0.95;

    public function getSlug(): string
    {
        return self::SLUG;
    }

    public function detect(): array
    {
        $tombstoned = $this->getTombstonedPersonIDs();
        $exclude1 = $this->excludeIDsClause('p1.ID', $tombstoned);
        $exclude2 = $this->excludeIDsClause('p2.ID', $tombstoned);

        $rows = DB::allRecords(
            'SELECT p1.ID AS Person1ID, p2.ID AS Person2ID, p1.StudentNumber
               FROM `%1$s` p1
               JOIN `%1$s` p2
                 ON p2.ID > p1.ID
                AND p2.StudentNumber = p1.StudentNumber
              WHERE p1.StudentNumber IS NOT NULL
                AND p1.StudentNumber != ""
                AND %2$s
                AND %3$s',
            [Person::$tableName, $exclude1, $exclude2]
        );

        return array_map(fn (array $row) => [
            'personAID' => (int) $row['Person1ID'],
            'personBID' => (int) $row['Person2ID'],
            'score' => self::SCORE,
            'evidence' => ['studentNumber' => $row['StudentNumber']],
        ], $rows);
    }
}
