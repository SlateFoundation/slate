<?php

declare(strict_types=1);

namespace Slate\People\Merge\Detectors;

use DB;
use Slate\People\Merge\MergeAudit;

/**
 * Shared helpers for the concrete detectors.
 */
abstract class AbstractDetector implements DetectorInterface
{
    /**
     * People already tombstoned as the source of a completed merge -- once
     * a pair is actually resolved there's nothing left to detect, so every
     * detector query excludes these IDs on both sides of a pair. A
     * completed merge is the only path that removes a person from future
     * detection; a dismissed/deferred candidate stays visible on purpose
     * (Candidate::upsertPair() is what protects those from resurrection).
     *
     * @return int[]
     */
    protected function getTombstonedPersonIDs(): array
    {
        // DB::allValues() itself treats a missing table as zero rows (no
        // merge has ever executed yet), not an error
        return array_map(intval(...), DB::allValues(
            'SourcePersonID',
            'SELECT SourcePersonID FROM `%s`',
            [MergeAudit::$tableName]
        ));
    }

    /**
     * A safe SQL boolean expression excluding $ids from $column -- "1"
     * (always true) when $ids is empty, so callers can always AND it in
     * without a conditional.
     *
     * @param int[] $ids
     */
    protected function excludeIDsClause(string $column, array $ids): string
    {
        if (count($ids) === 0) {
            return '1';
        }

        return sprintf('%s NOT IN (%s)', $column, implode(',', array_map(intval(...), $ids)));
    }
}
