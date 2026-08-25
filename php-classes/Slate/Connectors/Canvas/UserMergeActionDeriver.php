<?php

declare(strict_types=1);

namespace Slate\Connectors\Canvas;

use Emergence\Connectors\Mapping;
use Emergence\People\Person;

/**
 * Derives the canvas-user-merge follow-up action when a merge touches
 * Canvas mappings on both the source and target person. Registered against
 * MappingActionDeriverRegistry for the 'canvas' connector key (see
 * Connector::register()) and invoked by
 * Slate\People\Merge\Merge::mergeConnectorMappings() inside the merge
 * transaction.
 *
 * Direction: the target survives the Slate-side merge by definition, so its
 * Canvas account is always the destination; the source's Canvas account is
 * the one merge_into retires. When a person carries more than one `canvas`
 * mapping, the one actually representing them is picked by matching its
 * ExternalIdentifier (the Canvas login's SIS ID) against their own Slate
 * username -- the same signal the executor re-checks live at execute time.
 *
 * Field access on Person/Mapping instances goes through
 * getValue()/setFields() rather than the magic-property shorthand, for the
 * same reason documented on Slate\People\Merge\Merge: those classes carry
 * no @property annotations, so the shorthand is invisible to static
 * analysis on a file with no baseline coverage.
 *
 * @see Slate\People\Merge\MappingActionDeriverRegistry
 * @see specs/behaviors/person-merge.md#follow-up-actions
 */
class UserMergeActionDeriver
{
    /**
     * @param Mapping[] $sourceMappings the source person's `canvas` mappings
     * @param Mapping[] $targetMappings the target person's `canvas` mappings
     *
     * @return array<int, array{type: string, payload: array<string, string>}>
     */
    public static function derive(Person $Source, Person $Target, array $sourceMappings, array $targetMappings): array
    {
        $sourceUsername = static::username($Source);
        $targetUsername = static::username($Target);

        if ($sourceUsername === '' || $targetUsername === '') {
            // no username to normalize the Canvas SIS identity against on
            // one side -- nothing this executor could correctly verify
            return [];
        }

        $SourceMapping = static::pickMapping($sourceUsername, $sourceMappings);
        $TargetMapping = static::pickMapping($targetUsername, $targetMappings);

        if (!$SourceMapping instanceof Mapping || !$TargetMapping instanceof Mapping) {
            return [];
        }

        $sourceCanvasUserID = (string) $SourceMapping->getValue('ExternalKey');
        $destinationCanvasUserID = (string) $TargetMapping->getValue('ExternalKey');

        if ($sourceCanvasUserID === '' || $destinationCanvasUserID === '' || $sourceCanvasUserID === $destinationCanvasUserID) {
            // nothing to merge -- either mapping is malformed, or both
            // sides already point at the same Canvas account
            return [];
        }

        return [[
            'type' => Connector::ACTION_TYPE_USER_MERGE,
            'payload' => [
                'sourceCanvasUserID' => $sourceCanvasUserID,
                'destinationCanvasUserID' => $destinationCanvasUserID,
                'survivorUsername' => $targetUsername,
            ],
        ]];
    }

    protected static function username(Person $Person): string
    {
        if (!$Person::fieldExists('Username')) {
            return '';
        }

        return (string) $Person->getValue('Username');
    }

    /**
     * Picks the mapping whose SIS identifier (ExternalIdentifier) matches
     * the person's own Slate username -- the signal that it's the Canvas
     * account actually representing them -- falling back to the first
     * mapping when none matches (e.g. the SIS identifier hasn't been
     * provisioned by the connector yet).
     *
     * @param Mapping[] $mappings
     */
    protected static function pickMapping(string $username, array $mappings): ?Mapping
    {
        if (count($mappings) === 0) {
            return null;
        }

        foreach ($mappings as $CandidateMapping) {
            if ((string) $CandidateMapping->getValue('ExternalIdentifier') === $username) {
                return $CandidateMapping;
            }
        }

        return $mappings[0];
    }
}
