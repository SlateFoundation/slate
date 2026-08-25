<?php

declare(strict_types=1);

namespace Slate\People\Merge;

/**
 * Implemented by a connector to make one follow-up action Type executable
 * in place via POST /people/merge/actions/<id>/execute. An executor encodes
 * the whole correct procedure -- precondition checks, parameter derivation,
 * the external call(s), post-call cleanup, and verification -- and runs
 * only on an explicit, separately-authorized request.
 *
 * No concrete executors ship with this plan (see canvas-merge-executor).
 *
 * @see specs/behaviors/person-merge.md#follow-up-actions
 */
interface ActionExecutorInterface
{
    /**
     * Perform the external work for the given follow-up action.
     *
     * Implementations should throw an exception on failure -- its message
     * is recorded as the failed outcome's note and the action stays
     * retryable -- and return a human-readable outcome note on success.
     */
    public function execute(FollowUpAction $Action): string;
}
