<?php

namespace Slate\People\Merge;

use Emergence\People\Person;

/**
 * Maps a connector key to a callable that derives the follow-up actions
 * implied by a merge touching that connector's mappings on both the source
 * and target person. Called by Merge::mergeConnectorMappings() for every
 * connector present in both people's mapping sets, inside the merge
 * transaction.
 *
 * Deriver signature:
 *
 *   function (Person $Source, Person $Target, array $sourceMappings, array $targetMappings): array
 *
 * returning a list of ['type' => string, 'payload' => array] specs, each
 * becoming one FollowUpAction row. $sourceMappings/$targetMappings are the
 * \Emergence\Connectors\Mapping rows (pre-merge) for that connector.
 *
 * No concrete deriver ships with this plan -- connectors (e.g. Canvas, in
 * canvas-merge-executor) register their own.
 */
class MappingActionDeriverRegistry
{
    /** @var array<string, callable> */
    protected static array $derivers = [];

    public static function register(string $connector, callable $deriver): void
    {
        static::$derivers[$connector] = $deriver;
    }

    public static function get(string $connector): ?callable
    {
        return static::$derivers[$connector] ?? null;
    }

    /**
     * Test-only: clear all registered derivers.
     */
    public static function reset(): void
    {
        static::$derivers = [];
    }
}
