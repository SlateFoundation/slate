<?php

declare(strict_types=1);

namespace Slate\People\Merge\Detectors;

use DB;
use Emergence\People\Person;

/**
 * Matches people sharing the same (trimmed, case-insensitive) first and
 * last name. The weakest signal of the initial detector set -- common
 * names will over-generate -- so it carries the lowest base score;
 * persisted dismissals are the mitigation
 * (see plans/duplicate-candidates.md#risks--unknowns).
 *
 * @see specs/behaviors/person-merge.md#duplicate-candidates
 */
class IdenticalNameDetector extends AbstractDetector
{
    public const SLUG = 'identical-name';
    protected const SCORE = 0.4;

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
            'SELECT p1.ID AS Person1ID, p2.ID AS Person2ID, p1.FirstName, p1.LastName
               FROM `%1$s` p1
               JOIN `%1$s` p2
                 ON p2.ID > p1.ID
                AND LOWER(TRIM(p2.FirstName)) = LOWER(TRIM(p1.FirstName))
                AND LOWER(TRIM(p2.LastName)) = LOWER(TRIM(p1.LastName))
              WHERE TRIM(p1.FirstName) != ""
                AND TRIM(p1.LastName) != ""
                AND %2$s
                AND %3$s',
            [Person::$tableName, $exclude1, $exclude2]
        );

        return array_map(fn (array $row) => [
            'personAID' => (int) $row['Person1ID'],
            'personBID' => (int) $row['Person2ID'],
            'score' => self::SCORE,
            'evidence' => [
                'firstName' => $row['FirstName'],
                'lastName' => $row['LastName'],
            ],
        ], $rows);
    }
}
