<?php

declare(strict_types=1);

namespace Slate\Connectors\Canvas;

use Slate\People\Merge\ActionExecutorRegistry;
use Slate\People\Merge\MappingActionDeriverRegistry;

/**
 * Wires the Canvas connector into the person-merge follow-up-action
 * extension points (Slate\People\Merge\MappingActionDeriverRegistry and
 * Slate\People\Merge\ActionExecutorRegistry). Call register() once during
 * app bootstrap -- see php-config/Slate.config.d/canvas-merge-executor.php.
 *
 * Mapping convention: a `canvas` connector mapping's ExternalKey is the
 * Canvas user ID and its ExternalIdentifier is the Canvas login's SIS ID,
 * which the connector keeps in sync with the Slate username. Keying on the
 * Canvas user ID (rather than a fixed constant) matters for the merge
 * engine: Slate\People\Merge\Merge::getIdentityConflicts() treats two
 * mappings sharing the same (Connector, ExternalKey) with differing
 * ExternalIdentifier as a conflict requiring operator resolution, and a
 * resolution discards the losing side's mapping before follow-up actions
 * are derived. Two independent Canvas accounts must never collide on
 * ExternalKey, or this action would never get the chance to spawn.
 *
 * @see specs/behaviors/person-merge.md#follow-up-actions
 */
class Connector
{
    public const CONNECTOR_KEY = 'canvas';
    public const ACTION_TYPE_USER_MERGE = 'canvas-user-merge';

    public static function register(): void
    {
        MappingActionDeriverRegistry::register(static::CONNECTOR_KEY, UserMergeActionDeriver::derive(...));
        ActionExecutorRegistry::register(static::ACTION_TYPE_USER_MERGE, new UserMergeExecutor());
    }
}
