<?php

declare(strict_types=1);

namespace Slate\People\Merge\Detectors;

use DB;
use Emergence\People\ContactPoint\AbstractPoint;

/**
 * Matches two different people sharing an identical contact point (same
 * Class + normalized Data) -- the same comparison
 * Merge::mergeContactPoints() uses to dedupe during an actual merge, so a
 * pair this detector finds is guaranteed to dedupe cleanly if merged. A
 * pair sharing more than one contact point scores higher, capped at
 * MAX_SCORE.
 *
 * @see specs/behaviors/person-merge.md#duplicate-candidates
 */
class SharedContactPointDetector extends AbstractDetector
{
    public const SLUG = 'shared-contact-point';
    protected const BASE_SCORE = 0.8;
    protected const MAX_SCORE = 0.95;
    protected const SCORE_PER_EXTRA_MATCH = 0.05;

    public function getSlug(): string
    {
        return self::SLUG;
    }

    public function detect(): array
    {
        $tombstoned = $this->getTombstonedPersonIDs();
        $exclude1 = $this->excludeIDsClause('cp1.PersonID', $tombstoned);
        $exclude2 = $this->excludeIDsClause('cp2.PersonID', $tombstoned);

        $rows = DB::allRecords(
            'SELECT cp1.PersonID AS Person1ID, cp2.PersonID AS Person2ID, cp1.Class, cp1.Data
               FROM `%1$s` cp1
               JOIN `%1$s` cp2
                 ON cp2.PersonID > cp1.PersonID
                AND cp2.Class = cp1.Class
                AND cp2.Data = cp1.Data
              WHERE %2$s
                AND %3$s',
            [AbstractPoint::$tableName, $exclude1, $exclude2]
        );

        $byPair = [];
        foreach ($rows as $row) {
            $key = $row['Person1ID'].':'.$row['Person2ID'];
            $byPair[$key]['personAID'] = (int) $row['Person1ID'];
            $byPair[$key]['personBID'] = (int) $row['Person2ID'];
            $byPair[$key]['matches'][] = ['class' => $row['Class'], 'data' => $row['Data']];
        }

        $matches = [];
        foreach ($byPair as $pair) {
            $extraMatches = count($pair['matches']) - 1;
            $score = min(self::MAX_SCORE, self::BASE_SCORE + $extraMatches * self::SCORE_PER_EXTRA_MATCH);

            $matches[] = [
                'personAID' => $pair['personAID'],
                'personBID' => $pair['personBID'],
                'score' => $score,
                'evidence' => ['sharedContactPoints' => $pair['matches']],
            ];
        }

        return $matches;
    }
}
