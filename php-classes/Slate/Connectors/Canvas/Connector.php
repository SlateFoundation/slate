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
 * Mapping convention (matches production connector_mappings rows, and the
 * sibling gsuite connector): a `canvas` connector mapping's ExternalKey is
 * the constant UserMergeActionDeriver::EXTERNAL_KEY ('user[id]') and its
 * ExternalIdentifier is the numeric Canvas user id. Because ExternalKey is
 * a constant shared by every Canvas mapping, two Canvas-mapped people
 * always collide on (Connector, ExternalKey) with differing
 * ExternalIdentifier -- Slate\People\Merge\Merge::getIdentityConflicts()
 * would normally treat that as a conflict requiring operator resolution
 * (destroying one side's mapping), but it special-cases a connector with a
 * registered deriver and leaves both rows in place instead, letting this
 * deriver spawn the canvas-user-merge action from them. See that method's
 * docblock and mergeConnectorMappings for the other half of this.
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
