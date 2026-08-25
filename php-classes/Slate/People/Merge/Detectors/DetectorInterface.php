<?php

declare(strict_types=1);

namespace Slate\People\Merge\Detectors;

/**
 * A duplicate-candidate detector: a single set-based query over the person
 * tables reporting pairs it believes represent the same human. Run by
 * CandidateDetectionRunner, which upserts each finding via
 * Candidate::upsertPair() -- detectors themselves never write.
 *
 * @see specs/behaviors/person-merge.md#duplicate-candidates
 */
interface DetectorInterface
{
    /**
     * Short, stable identifier persisted on the candidate record
     * (Candidate::$Detector), e.g. "identical-name".
     */
    public function getSlug(): string;

    /**
     * @return array<int, array{personAID:int, personBID:int, score:float, evidence:array}>
     */
    public function detect(): array;
}
