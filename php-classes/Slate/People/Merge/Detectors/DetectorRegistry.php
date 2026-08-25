<?php

declare(strict_types=1);

namespace Slate\People\Merge\Detectors;

/**
 * Ordered list of duplicate detectors run by CandidateDetectionRunner.
 * Registered weakest-signal-first: when more than one detector matches the
 * same pair in a single run, the strongest match (registered last) is what
 * ends up attributed on the candidate record, since
 * Candidate::upsertPair() overwrites an open pair's Detector/Score/
 * Evidence on every match within a run.
 */
class DetectorRegistry
{
    /** @var array<string, DetectorInterface> */
    protected static array $detectors = [];
    protected static bool $defaultsRegistered = false;

    public static function register(DetectorInterface $detector): void
    {
        static::ensureDefaults();
        static::$detectors[$detector->getSlug()] = $detector;
    }

    /**
     * @return DetectorInterface[]
     */
    public static function getAll(): array
    {
        static::ensureDefaults();

        return array_values(static::$detectors);
    }

    /**
     * Test-only: remove a registered detector.
     */
    public static function unregister(string $slug): void
    {
        unset(static::$detectors[$slug]);
    }

    /**
     * Test-only: clear back to an empty registry (no defaults re-seeded).
     */
    public static function reset(): void
    {
        static::$detectors = [];
        static::$defaultsRegistered = true;
    }

    protected static function ensureDefaults(): void
    {
        if (static::$defaultsRegistered) {
            return;
        }

        static::$defaultsRegistered = true;

        // weakest signal first -- see class docblock
        foreach (static::getDefaultDetectors() as $detector) {
            static::$detectors[$detector->getSlug()] = $detector;
        }
    }

    /**
     * @return DetectorInterface[]
     */
    protected static function getDefaultDetectors(): array
    {
        return [
            new IdenticalNameDetector(),
            new MappingAnomalyDetector(),
            new SharedContactPointDetector(),
            new IdenticalStudentNumberDetector(),
        ];
    }
}
