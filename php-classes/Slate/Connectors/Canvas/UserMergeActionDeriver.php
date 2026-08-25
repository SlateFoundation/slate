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
 * transaction, on the pre-mutation mapping arrays -- so this always sees
 * both sides' original rows, even though mergeConnectorMappings itself
 * retires (rather than moves) the source's row for a connector this class
 * owns a deriver for (see that method's docblock).
 *
 * Production mapping convention: a `canvas` connector mapping's
 * ExternalKey is the constant 'user[id]' (matching the sibling gsuite
 * connector's convention) and its ExternalIdentifier is the numeric Canvas
 * user id. Direction: the target survives the Slate-side merge by
 * definition, so its Canvas user id is always the destination; the
 * source's is the one merge_into retires.
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
     * The Canvas connector mapping's constant ExternalKey, identifying a
     * mapping row as "the Canvas user id for this person" (as opposed to
     * some other kind of Canvas mapping this connector might record).
     */
    public const EXTERNAL_KEY = 'user[id]';

    /**
     * @param Mapping[] $sourceMappings the source person's `canvas` mappings
     * @param Mapping[] $targetMappings the target person's `canvas` mappings
     *
     * @return array<int, array{type: string, payload: array<string, string>}>
     */
    public static function derive(Person $Source, Person $Target, array $sourceMappings, array $targetMappings): array
    {
        $SourceMapping = static::findUserMapping($sourceMappings);
        $TargetMapping = static::findUserMapping($targetMappings);

        if (!$SourceMapping instanceof Mapping || !$TargetMapping instanceof Mapping) {
            return [];
        }

        $sourceCanvasUserID = (string) $SourceMapping->getValue('ExternalIdentifier');
        $destinationCanvasUserID = (string) $TargetMapping->getValue('ExternalIdentifier');

        if ($sourceCanvasUserID === '' || $destinationCanvasUserID === '' || $sourceCanvasUserID === $destinationCanvasUserID) {
            // identical identifiers is the exact-duplicate case
            // mergeConnectorMappings already dedupes on its own -- no
            // external merge is implied
            return [];
        }

        return [[
            'type' => Connector::ACTION_TYPE_USER_MERGE,
            'payload' => [
                'sourceCanvasUserID' => $sourceCanvasUserID,
                'destinationCanvasUserID' => $destinationCanvasUserID,
            ],
        ]];
    }

    /**
     * @param Mapping[] $mappings
     */
    protected static function findUserMapping(array $mappings): ?Mapping
    {
        foreach ($mappings as $CandidateMapping) {
            if ((string) $CandidateMapping->getValue('ExternalKey') === static::EXTERNAL_KEY) {
                return $CandidateMapping;
            }
        }

        return null;
    }
}
