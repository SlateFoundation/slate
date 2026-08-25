<?php

namespace Slate\People\Merge;

use Exception;
use Emergence\People\Person;

/**
 * A durable work item for a cross-system implication of a merge -- e.g.
 * "merge the two LMS users" -- workable by an operator, an agent, or a
 * connector-provided executor (see ActionExecutorRegistry).
 *
 * Status lifecycle: pending -> completed | skipped | failed; failed is
 * retryable back to pending. Every transition is required to carry an
 * outcome note recording who/what acted and the result.
 *
 * @property int $ID
 * @property string $Class
 * @property int $MergeAuditID
 * @property string $Type
 * @property string $Connector
 * @property array|null $Payload
 * @property string $Status
 * @property array|null $OutcomeLog
 * @property MergeAudit|null $MergeAudit
 * @property bool $hasExecutor
 *
 * @see specs/behaviors/person-merge.md#follow-up-actions
 */
class FollowUpAction extends \ActiveRecord
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_SKIPPED = 'skipped';
    public const STATUS_FAILED = 'failed';

    // ActiveRecord configuration
    public static $tableName = 'merge_followup_actions';
    public static $singularNoun = 'follow-up action';
    public static $pluralNoun = 'follow-up actions';
    public static $collectionRoute = '/people/merge/actions';

    // required for shared-table subclassing support
    public static $rootClass = self::class;
    public static $defaultClass = self::class;
    public static $subClasses = [self::class];

    public static $fields = [
        'MergeAuditID' => [
            'type' => 'integer',
            'unsigned' => true,
        ],
        'Type' => [
            'type' => 'string',
            'description' => 'Connector-defined action type, e.g. "canvas-user-merge"',
        ],
        'Connector' => [
            'type' => 'string',
            'description' => 'Key of the owning connector, used to look up an executor',
        ],
        'Payload' => [
            'type' => 'json',
            'notnull' => false,
        ],
        'Status' => [
            'type' => 'enum',
            'values' => [self::STATUS_PENDING, self::STATUS_COMPLETED, self::STATUS_SKIPPED, self::STATUS_FAILED],
            'default' => self::STATUS_PENDING,
        ],
        'OutcomeLog' => [
            'type' => 'json',
            'notnull' => false,
            'default' => null,
            'description' => 'Ordered list of {status, notes, actorID, actorLabel, timestamp} entries',
        ],
    ];

    public static $relationships = [
        'MergeAudit' => [
            'type' => 'one-one',
            'class' => MergeAudit::class,
            'local' => 'MergeAuditID',
        ],
    ];

    public static $dynamicFields = [
        'MergeAudit',
        'hasExecutor' => [
            'method' => 'hasExecutor',
        ],
    ];

    public static $indexes = [
        'MergeAudit' => [
            'fields' => ['MergeAuditID'],
        ],
        'Status' => [
            'fields' => ['Status'],
        ],
    ];

    public function hasExecutor(): bool
    {
        return ActionExecutorRegistry::has($this->Type);
    }

    /**
     * Record a status transition with a required outcome note, enforcing the
     * lifecycle: pending -> completed|skipped|failed; failed|skipped ->
     * pending (retry/re-open); completed is terminal.
     *
     * @param string $actorLabel e.g. "operator:jsmith", "executor:canvas", "agent"
     */
    public function recordOutcome(string $status, string $notes, string $actorLabel = 'operator', ?Person $Actor = null): void
    {
        if (!in_array($status, [self::STATUS_PENDING, self::STATUS_COMPLETED, self::STATUS_SKIPPED, self::STATUS_FAILED], true)) {
            throw new Exception("Invalid follow-up action status: $status");
        }

        if (trim($notes) === '') {
            throw new Exception('An outcome note is required to record a status transition');
        }

        if ($this->Status === self::STATUS_COMPLETED) {
            throw new Exception('This follow-up action is already completed and cannot be transitioned further');
        }

        if ($status === self::STATUS_PENDING && $this->Status === self::STATUS_PENDING) {
            throw new Exception('Follow-up action is already pending');
        }

        $log = $this->OutcomeLog ?? [];
        $log[] = [
            'status' => $status,
            'notes' => $notes,
            'actorID' => $Actor instanceof \Emergence\People\Person ? (int) $Actor->getValue('ID') : null,
            'actorLabel' => $actorLabel,
            'timestamp' => date('c'),
        ];

        $this->OutcomeLog = $log;
        $this->Status = $status;
    }
}
