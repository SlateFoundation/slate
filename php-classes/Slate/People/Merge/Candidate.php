<?php

declare(strict_types=1);

namespace Slate\People\Merge;

use Exception;
use Emergence\People\Person;

/**
 * A detected duplicate-person pair, persisted so a decision made once is
 * never re-litigated. (Person1ID, Person2ID) is stored in a fixed order
 * (Person1ID < Person2ID) and is unique -- at most one candidate record
 * exists per pair, regardless of how many detectors match it (see
 * upsertPair()).
 *
 * Status lifecycle: open -> merged | dismissed | deferred, plus
 * dismissed/deferred -> open (re-open). merged happens only via
 * Merge::execute()'s $candidateID linkage (see markMerged()) -- never
 * through recordDecision(), which is the PATCH endpoint's only entry point
 * and enforces the operator-facing rules: dismissed/deferred/re-open all
 * require notes, and merged is terminal (no leaving it).
 *
 * @property int $ID
 * @property string $Class
 * @property int $Person1ID
 * @property int $Person2ID
 * @property string $Detector
 * @property float $Score
 * @property array|null $Evidence
 * @property string $Status
 * @property int|null $MergeAuditID
 * @property array|null $DecisionLog
 * @property Person|null $Person1
 * @property Person|null $Person2
 * @property MergeAudit|null $MergeAudit
 *
 * @see specs/behaviors/person-merge.md#duplicate-candidates
 * @see specs/api/person-merge.md
 */
class Candidate extends \ActiveRecord
{
    public const STATUS_OPEN = 'open';
    public const STATUS_MERGED = 'merged';
    public const STATUS_DISMISSED = 'dismissed';
    public const STATUS_DEFERRED = 'deferred';

    /**
     * Statuses reachable through recordDecision() (the PATCH endpoint).
     * STATUS_MERGED is deliberately excluded -- it's reachable only via
     * markMerged(), called exclusively from Merge::execute().
     */
    protected const DECIDABLE_STATUSES = [self::STATUS_OPEN, self::STATUS_DISMISSED, self::STATUS_DEFERRED];

    // ActiveRecord configuration
    public static $tableName = 'merge_candidates';
    public static $singularNoun = 'duplicate candidate';
    public static $pluralNoun = 'duplicate candidates';
    public static $collectionRoute = '/people/merge/candidates';

    // required for shared-table subclassing support
    public static $rootClass = self::class;
    public static $defaultClass = self::class;
    public static $subClasses = [self::class];

    public static $fields = [
        'Person1ID' => [
            'type' => 'integer',
            'unsigned' => true,
        ],
        'Person2ID' => [
            'type' => 'integer',
            'unsigned' => true,
        ],
        'Detector' => [
            'type' => 'string',
            'description' => 'Slug of the detector that (most recently) matched this pair, e.g. "identical-name"',
        ],
        'Score' => [
            'type' => 'float',
            'unsigned' => true,
        ],
        'Evidence' => [
            'type' => 'json',
            'notnull' => false,
            'description' => 'Detector-specific description of what matched',
        ],
        'Status' => [
            'type' => 'enum',
            'values' => [self::STATUS_OPEN, self::STATUS_MERGED, self::STATUS_DISMISSED, self::STATUS_DEFERRED],
            'default' => self::STATUS_OPEN,
        ],
        'MergeAuditID' => [
            'type' => 'integer',
            'unsigned' => true,
            'notnull' => false,
            'description' => 'Set when Status is merged -- links to the merge audit that resolved this pair',
        ],
        'DecisionLog' => [
            'type' => 'json',
            'notnull' => false,
            'default' => null,
            'description' => 'Ordered list of {status, notes, actorID, actorLabel, timestamp} entries',
        ],
    ];

    public static $relationships = [
        'Person1' => [
            'type' => 'one-one',
            'class' => Person::class,
            'local' => 'Person1ID',
        ],
        'Person2' => [
            'type' => 'one-one',
            'class' => Person::class,
            'local' => 'Person2ID',
        ],
        'MergeAudit' => [
            'type' => 'one-one',
            'class' => MergeAudit::class,
            'local' => 'MergeAuditID',
        ],
    ];

    public static $dynamicFields = [
        'Person1',
        'Person2',
        'MergeAudit',
    ];

    public static $indexes = [
        'Pair' => [
            'fields' => ['Person1ID', 'Person2ID'],
            'unique' => true,
        ],
        'Status' => [
            'fields' => ['Status'],
        ],
    ];

    /**
     * Idempotent upsert used by detectors: creates an open candidate for a
     * newly-found pair, re-scores an existing open pair's Detector/Score/
     * Evidence, and leaves a dismissed/deferred/merged pair completely
     * untouched -- a settled decision is never resurrected by a re-run.
     */
    public static function upsertPair(int $personAID, int $personBID, string $detector, float $score, array $evidence): self
    {
        if ($personAID === $personBID) {
            throw new Exception('A candidate pair must reference two different people');
        }

        $person1ID = min($personAID, $personBID);
        $person2ID = max($personAID, $personBID);

        $Existing = static::getByWhere(['Person1ID' => $person1ID, 'Person2ID' => $person2ID]);

        if ($Existing === null) {
            return static::create([
                'Person1ID' => $person1ID,
                'Person2ID' => $person2ID,
                'Detector' => $detector,
                'Score' => $score,
                'Evidence' => $evidence,
                'Status' => self::STATUS_OPEN,
            ], true);
        }

        if ($Existing->Status === self::STATUS_OPEN) {
            $Existing->setFields([
                'Detector' => $detector,
                'Score' => $score,
                'Evidence' => $evidence,
            ]);
            $Existing->save();
        }

        return $Existing;
    }

    /**
     * Record an operator decision: dismiss, defer, or re-open a dismissed/
     * deferred pair back to open. Always requires a note; never allowed
     * once the pair is merged (terminal) or when the requested status
     * matches the current one (nothing to record).
     */
    public function recordDecision(string $status, string $notes, string $actorLabel = 'operator', ?Person $Actor = null): void
    {
        if (!in_array($status, static::DECIDABLE_STATUSES, true)) {
            throw new Exception("Invalid candidate decision status: $status");
        }

        if (trim($notes) === '') {
            throw new Exception('Notes are required to record a candidate decision');
        }

        if ($this->Status === self::STATUS_MERGED) {
            throw new Exception('This candidate pair has already been merged and cannot be transitioned further');
        }

        if ($status === $this->Status) {
            throw new Exception("Candidate pair is already $status");
        }

        $log = $this->DecisionLog ?? [];
        $log[] = [
            'status' => $status,
            'notes' => $notes,
            'actorID' => $Actor instanceof Person ? (int) $Actor->getValue('ID') : null,
            'actorLabel' => $actorLabel,
            'timestamp' => date('c'),
        ];

        $this->DecisionLog = $log;
        $this->Status = $status;
    }

    /**
     * Transition to merged, linking the resolving merge audit. Called only
     * from Merge::execute() when a $candidateID is supplied -- never
     * reachable via the PATCH endpoint (recordDecision() deliberately
     * excludes STATUS_MERGED). Idempotent: a repeat call for the same audit
     * (e.g. a repeated execute request for an already-merged source) is a
     * no-op rather than an error.
     */
    public function markMerged(MergeAudit $Audit): void
    {
        $auditID = (int) $Audit->getValue('ID');

        if ($this->Status === self::STATUS_MERGED) {
            if ((int) $this->MergeAuditID !== $auditID) {
                throw new Exception('This candidate pair is already linked to a different merge audit');
            }

            return;
        }

        $log = $this->DecisionLog ?? [];
        $log[] = [
            'status' => self::STATUS_MERGED,
            'notes' => 'Resolved by merge audit #'.$auditID,
            'actorID' => null,
            'actorLabel' => 'merge:execute',
            'timestamp' => date('c'),
        ];

        $this->DecisionLog = $log;
        $this->Status = self::STATUS_MERGED;
        $this->MergeAuditID = $auditID;
    }
}
