<?php

declare(strict_types=1);

namespace Slate\People\Merge;

use Exception;

/**
 * Thrown by Merge::execute() when identity conflicts between the source and
 * target are not fully addressed by the request's `resolutions`. Carries
 * the same conflict list preview() reports, so a caller can surface it
 * without writing anything.
 */
class MergeConflictException extends Exception
{
    public function __construct(/** @var array<int, array{field: string, sourceValue: mixed, targetValue: mixed, resolutionKey: string}> */
        public array $conflicts
    ) {
        parent::__construct('Merge has unresolved identity conflicts: '.implode(', ', array_column($this->conflicts, 'resolutionKey')));
    }
}
