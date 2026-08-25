<?php

declare(strict_types=1);

namespace Slate\People\Merge;

use Slate\People\Merge\Detectors\DetectorRegistry;

/**
 * Runs every registered detector and upserts its findings via
 * Candidate::upsertPair(), which enforces the idempotency rules: a newly
 * found pair opens, an open pair re-scores, and a dismissed/deferred/
 * merged pair is left untouched. Runnable from
 * site-root/powertools/duplicate-detection.php, or any future cron-able
 * entry point that calls CandidateDetectionRunner::run().
 *
 * @see specs/behaviors/person-merge.md#duplicate-candidates
 */
class CandidateDetectionRunner
{
    /**
     * @return array<string, int> matches found per detector slug (not the
     *                             same as candidates opened -- see
     *                             Candidate::upsertPair())
     */
    public static function run(): array
    {
        $summary = [];

        foreach (DetectorRegistry::getAll() as $Detector) {
            $matches = $Detector->detect();

            foreach ($matches as $match) {
                Candidate::upsertPair(
                    $match['personAID'],
                    $match['personBID'],
                    $Detector->getSlug(),
                    $match['score'],
                    $match['evidence']
                );
            }

            $summary[$Detector->getSlug()] = count($matches);
        }

        return $summary;
    }
}
