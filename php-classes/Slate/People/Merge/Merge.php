<?php

namespace Slate\People\Merge;

use DB;
use Exception;
use TableNotFoundException;
use Emergence\People\Person;
use Emergence\People\Relationship;
use Emergence\People\ContactPoint\AbstractPoint;
use Emergence\Connectors\Mapping;
use Slate\People\Student;

/**
 * The transactional person-merge operation: validate -> detect conflicts ->
 * walk the merge registry -> tombstone the source -> write the audit record
 * -> spawn follow-up actions, all inside one DB transaction.
 *
 * Field access on Person/Student/Relationship/Mapping/AbstractPoint
 * instances throughout this class goes through getValue()/setFields()
 * rather than the usual magic-property shorthand (`$Person->ID`). Those
 * classes are populated dynamically from their $fields config (see
 * ActiveRecord::__get/__set) and Slate doesn't carry @property annotations
 * for them, so the shorthand is invisible to static analysis on a freshly
 * added file with no baseline coverage; getValue()/setFields() are the same
 * classes' normal *declared* public API and keep this file clean without
 * touching phpstan-baseline.neon.
 *
 * @see specs/behaviors/person-merge.md
 * @see specs/api/person-merge.md
 */
class Merge
{
    /**
     * Person fields copied onto the target when the target is missing a
     * value and the source has one ("missing target fields are filled from
     * the source"). StudentNumber is also independently conflict-checked
     * (see getIdentityConflicts) -- when both sides have differing values
     * it's excluded from this simple fill and instead requires resolution.
     */
    protected const FILLABLE_FIELDS = [
        'MiddleName', 'PreferredName', 'NameSuffix', 'Gender', 'BirthDate',
        'Location', 'About', 'StudentNumber', 'AdvisorID', 'GraduationYear',
    ];

    /**
     * Read-only report of what an execute() would do. Never writes.
     */
    public static function preview(Person $Source, Person $Target): array
    {
        $conflicts = static::getIdentityConflicts($Source, $Target);

        $impact = [];
        foreach (MergeRegistry::getEntries() as $key => $entry) {
            $result = static::planEntry($entry, $Source, $Target);
            $impact[$key] = [
                'label' => $entry['label'] ?? $key,
                'moved' => $result['moved'],
                'deduped' => $result['deduped'],
            ];
        }

        return [
            'conflicts' => $conflicts,
            'impact' => $impact,
            'followupActions' => static::previewFollowUpActions($Source, $Target),
        ];
    }

    /**
     * Execute the merge. Returns the MergeAudit record (a repeat execute for
     * an already-merged source returns the prior audit rather than failing).
     *
     * @throws MergeConflictException when conflicts exist and aren't fully
     *                                addressed by $resolutions
     */
    public static function execute(Person $Source, Person $Target, array $resolutions = [], $candidateID = null): MergeAudit
    {
        $sourceID = static::personID($Source);
        $targetID = static::personID($Target);

        if ($sourceID === $targetID) {
            throw new Exception('Cannot merge a person into themselves');
        }

        if ($PriorAudit = MergeAudit::getByPreviousSource($sourceID)) {
            // a repeated execute request may supply a candidateID that
            // wasn't linked on the original call (e.g. the first execute
            // happened outside the candidate queue) -- link it now so the
            // pair still ends up merged rather than stuck open forever
            static::linkCandidate($candidateID, $PriorAudit);

            return $PriorAudit;
        }

        $conflicts = static::getIdentityConflicts($Source, $Target);
        static::validateResolutions($conflicts, $resolutions);

        $sourceSnapshot = static::snapshotIdentity($Source);

        // ensure the audit/action tables exist BEFORE the transaction opens:
        // their lazy first-use auto-create is DDL, which implicitly commits
        // in MySQL and would silently break the rollback guarantee on the
        // first-ever merge in a site's life
        foreach ([MergeAudit::class, FollowUpAction::class] as $recordClass) {
            if (!(bool) DB::oneValue('SHOW TABLES LIKE "%s"', [$recordClass::$tableName])) {
                DB::multiQuery(\SQL::getCreateTable($recordClass));
            }
        }

        DB::nonQuery('START TRANSACTION');

        try {
            // release source's copy of any field-level conflict resolved in
            // its own favor before the target adopts the value, to avoid
            // colliding with a unique constraint (e.g. StudentNumber)
            $sourceClears = [];
            foreach ($conflicts as $conflict) {
                if (str_starts_with($conflict['resolutionKey'], 'mapping:')) {
                    continue;
                }
                if ((string) $resolutions[$conflict['resolutionKey']] === (string) $conflict['sourceValue']) {
                    $sourceClears[$conflict['field']] = null;
                }
            }
            if (count($sourceClears) > 0) {
                $Source->setFields($sourceClears);
                $Source->save();
            }

            // fill missing target fields from source, then apply resolved
            // conflict values (which win regardless of the fill rule)
            $targetUpdates = [];
            foreach (static::FILLABLE_FIELDS as $field) {
                if (!$Target::fieldExists($field)) {
                    continue;
                }
                if (!$Source::fieldExists($field)) {
                    continue;
                }
                $targetValue = $Target->getValue($field);
                $sourceValue = $Source->getValue($field);

                if (($targetValue === null || $targetValue === '') && $sourceValue !== null && $sourceValue !== '') {
                    $targetUpdates[$field] = $sourceValue;
                }
            }
            foreach ($conflicts as $conflict) {
                if (str_starts_with($conflict['resolutionKey'], 'mapping:')) {
                    continue;
                }
                $targetUpdates[$conflict['field']] = $resolutions[$conflict['resolutionKey']];
            }
            if (count($targetUpdates) > 0) {
                $Target->setFields($targetUpdates);
                $Target->save();
            }

            // drop the losing side of any connector-mapping identity conflict
            static::applyMappingResolutions($Source, $Target, $conflicts, $resolutions);

            // walk the registry -- entries flagged 'runLast' (contact points)
            // run after every other entry: the report-recipient tables'
            // EmailContactID references need the contact-point dedupe map
            // to remap any dropped duplicates
            $tableCounts = [];
            $followUpActionSpecs = [];
            $entries = MergeRegistry::getEntries();
            $deferred = array_filter($entries, fn (array $entry) => array_key_exists('runLast', $entry) && $entry['runLast']);
            $immediate = array_diff_key($entries, $deferred);

            foreach ($immediate + $deferred as $key => $entry) {
                $result = static::applyEntry($entry, $Source, $Target);
                $tableCounts[$key] = [
                    'label' => $entry['label'] ?? $key,
                    'moved' => $result['moved'],
                    'deduped' => $result['deduped'],
                ];
                if (array_key_exists('actions', $result) && count($result['actions']) > 0) {
                    $followUpActionSpecs = array_merge($followUpActionSpecs, $result['actions']);
                }
                if (array_key_exists('remap', $result) && count($result['remap']) > 0) {
                    static::remapContactPointReferences($result['remap']);
                }
            }

            // tombstone the source: disabled, username freed for reuse
            $tombstoneUsername = static::tombstoneSource($Source);

            // write the audit record
            $Audit = MergeAudit::create([
                'SourcePersonID' => $sourceID,
                'TargetPersonID' => $targetID,
                'TombstoneUsername' => $tombstoneUsername,
                'SourceSnapshot' => $sourceSnapshot,
                'TableCounts' => $tableCounts,
                'CandidateID' => $candidateID,
            ], true);

            $auditID = static::recordID($Audit);

            // transition the resolved candidate pair (if any) to merged,
            // inside the same transaction as everything else it depends on
            static::linkCandidate($candidateID, $Audit);

            // spawn follow-up actions, linked to the now-existing audit
            foreach ($followUpActionSpecs as $spec) {
                FollowUpAction::create([
                    'MergeAuditID' => $auditID,
                    'Type' => $spec['type'],
                    'Connector' => $spec['connector'],
                    'Payload' => $spec['payload'] ?? [],
                ], true);
            }

            DB::nonQuery('COMMIT');
        } catch (Exception $e) {
            DB::nonQuery('ROLLBACK');
            throw $e;
        }

        return $Audit;
    }

    // ------------------------------------------------------------------
    // Identity conflicts
    // ------------------------------------------------------------------

    /**
     * @return array<int, array{field: string, sourceValue: mixed, targetValue: mixed, resolutionKey: string}>
     */
    public static function getIdentityConflicts(Person $Source, Person $Target): array
    {
        $conflicts = [];

        if ($Source->isA(Student::class) && $Target->isA(Student::class)) {
            $sourceNumber = $Source->getValue('StudentNumber');
            $targetNumber = $Target->getValue('StudentNumber');

            if ($sourceNumber && $targetNumber && (string) $sourceNumber !== (string) $targetNumber) {
                $conflicts[] = [
                    'field' => 'StudentNumber',
                    'sourceValue' => $sourceNumber,
                    'targetValue' => $targetNumber,
                    'resolutionKey' => 'StudentNumber',
                ];
            }
        }

        $sourceID = static::personID($Source);
        $targetID = static::personID($Target);
        $rootClass = Person::getRootClass();
        $sourceMappings = Mapping::getAllByWhere(['ContextClass' => $rootClass, 'ContextID' => $sourceID]);
        $targetMappings = Mapping::getAllByWhere(['ContextClass' => $rootClass, 'ContextID' => $targetID]);

        $targetByKey = [];
        foreach ($targetMappings as $TM) {
            $targetByKey[$TM->getValue('Connector').':'.$TM->getValue('ExternalKey')][] = $TM;
        }

        foreach ($sourceMappings as $SM) {
            $sourceConnector = $SM->getValue('Connector');
            $sourceExternalKey = $SM->getValue('ExternalKey');
            $sourceIdentifier = $SM->getValue('ExternalIdentifier');

            foreach ($targetByKey[$sourceConnector.':'.$sourceExternalKey] ?? [] as $TM) {
                $targetIdentifier = $TM->getValue('ExternalIdentifier');

                if ($targetIdentifier !== $sourceIdentifier) {
                    $resolutionKey = sprintf('mapping:%s:%s', $sourceConnector, $sourceExternalKey);
                    $conflicts[] = [
                        'field' => $resolutionKey,
                        'sourceValue' => $sourceIdentifier,
                        'targetValue' => $targetIdentifier,
                        'resolutionKey' => $resolutionKey,
                    ];
                }
            }
        }

        return $conflicts;
    }

    protected static function validateResolutions(array $conflicts, array $resolutions): void
    {
        if (count($conflicts) === 0) {
            return;
        }

        foreach ($conflicts as $conflict) {
            $key = $conflict['resolutionKey'];

            if (!array_key_exists($key, $resolutions)) {
                throw new MergeConflictException($conflicts);
            }

            $winner = (string) $resolutions[$key];
            if ($winner !== (string) $conflict['sourceValue'] && $winner !== (string) $conflict['targetValue']) {
                throw new Exception("Resolution for '$key' must match either the source or target value");
            }
        }
    }

    protected static function applyMappingResolutions(Person $Source, Person $Target, array $conflicts, array $resolutions): void
    {
        $sourceID = static::personID($Source);
        $targetID = static::personID($Target);
        $rootClass = Person::getRootClass();

        foreach ($conflicts as $conflict) {
            if (!str_starts_with($conflict['resolutionKey'], 'mapping:')) {
                continue;
            }

            [, $connector, $externalKey] = explode(':', $conflict['resolutionKey'], 3);
            $winner = (string) $resolutions[$conflict['resolutionKey']];

            if ($winner === (string) $conflict['sourceValue']) {
                // source's identifier wins; drop target's competing mapping
                $TM = Mapping::getByWhere([
                    'ContextClass' => $rootClass, 'ContextID' => $targetID,
                    'Connector' => $connector, 'ExternalKey' => $externalKey,
                ]);
                if ($TM !== null) {
                    $TM->destroy();
                }
            } else {
                // target's identifier wins; drop source's so it isn't moved
                $SM = Mapping::getByWhere([
                    'ContextClass' => $rootClass, 'ContextID' => $sourceID,
                    'Connector' => $connector, 'ExternalKey' => $externalKey,
                ]);
                if ($SM !== null) {
                    $SM->destroy();
                }
            }
        }
    }

    // ------------------------------------------------------------------
    // Registry walk: generic (SQL-level, bulk) entries
    // ------------------------------------------------------------------

    protected static function planEntry(array $entry, Person $Source, Person $Target): array
    {
        if (array_key_exists('mover', $entry)) {
            $result = call_user_func($entry['mover'], $Source, $Target, true);
            return ['moved' => $result['moved'], 'deduped' => $result['deduped']];
        }

        return static::planGenericEntry($entry, static::personID($Source), static::personID($Target));
    }

    protected static function applyEntry(array $entry, Person $Source, Person $Target): array
    {
        if (array_key_exists('mover', $entry)) {
            return call_user_func($entry['mover'], $Source, $Target, false);
        }

        return static::applyGenericEntry($entry, static::personID($Source), static::personID($Target));
    }

    protected static function buildColumnAndCondition(array $entry): array
    {
        if (array_key_exists('contextClass', $entry)) {
            return ['ContextID', sprintf('ContextClass = "%s"', DB::escape($entry['contextClass']))];
        }

        return [$entry['column'], '1'];
    }

    protected static function buildDuplicateExistsSql(string $table, string $column, int $targetID, string $condition, array $uniqueColumns): string
    {
        $matchers = array_map(
            fn ($col) => sprintf('tgt.`%1$s` <=> src.`%1$s`', $col),
            $uniqueColumns
        );

        return sprintf(
            'SELECT 1 FROM `%s` tgt WHERE tgt.`%s` = %u AND (%s) AND %s',
            $table,
            $column,
            $targetID,
            $condition,
            implode(' AND ', $matchers)
        );
    }

    protected static function planGenericEntry(array $entry, int $sourceID, int $targetID): array
    {
        [$column, $condition] = static::buildColumnAndCondition($entry);
        $table = $entry['table'];

        try {
            $total = (int) DB::oneValue(
                'SELECT COUNT(*) FROM `%s` WHERE `%s` = %u AND (%s)',
                [$table, $column, $sourceID, $condition]
            );
        } catch (TableNotFoundException) {
            return ['moved' => 0, 'deduped' => 0];
        }

        $deduped = 0;
        if (array_key_exists('uniqueColumns', $entry) && count($entry['uniqueColumns']) > 0) {
            $existsSql = static::buildDuplicateExistsSql($table, $column, $targetID, $condition, $entry['uniqueColumns']);
            $deduped = (int) DB::oneValue(
                'SELECT COUNT(*) FROM `%s` src WHERE src.`%s` = %u AND (%s) AND EXISTS (%s)',
                [$table, $column, $sourceID, $condition, $existsSql]
            );
        }

        return ['moved' => $total - $deduped, 'deduped' => $deduped];
    }

    protected static function applyGenericEntry(array $entry, int $sourceID, int $targetID): array
    {
        [$column, $condition] = static::buildColumnAndCondition($entry);
        $table = $entry['table'];

        try {
            return static::applyGenericEntryQueries($entry, $table, $column, $condition, $sourceID, $targetID);
        } catch (TableNotFoundException) {
            // framework tables create on first use, so an absent table just
            // means zero rows -- e.g. a leaf without the module enabled
            return ['moved' => 0, 'deduped' => 0];
        }
    }

    protected static function applyGenericEntryQueries(array $entry, string $table, string $column, string $condition, int $sourceID, int $targetID): array
    {
        $deduped = 0;
        if (array_key_exists('uniqueColumns', $entry) && count($entry['uniqueColumns']) > 0) {
            // MySQL forbids a DELETE whose subquery reads the target table
            // (error 1093), so unlike planGenericEntry's EXISTS this joins a
            // materialized derived table of the target person's rows
            $matchers = array_map(
                fn ($col) => sprintf('tgt.`%1$s` <=> src.`%1$s`', $col),
                $entry['uniqueColumns']
            );

            DB::nonQuery(
                'DELETE src FROM `%s` src JOIN (SELECT * FROM `%s` WHERE `%s` = %u AND (%s)) tgt ON %s WHERE src.`%s` = %u AND (%s)',
                [$table, $table, $column, $targetID, $condition, implode(' AND ', $matchers), $column, $sourceID, $condition]
            );
            $deduped = DB::affectedRows();
        }

        DB::nonQuery(
            'UPDATE `%s` SET `%s` = %u WHERE `%s` = %u AND (%s)',
            [$table, $column, $targetID, $column, $sourceID, $condition]
        );
        $moved = DB::affectedRows();

        return ['moved' => $moved, 'deduped' => $deduped];
    }

    /**
     * Rows referencing a contact point ID (report-recipient tables) whose
     * source contact point was dropped as a duplicate need remapping to the
     * surviving target contact point, or they'd point at a deleted row.
     *
     * @param array<int,int> $remap sourceContactPointID => targetContactPointID
     */
    protected static function remapContactPointReferences(array $remap): void
    {
        if (count($remap) === 0) {
            return;
        }

        foreach (MergeRegistry::getEntries() as $entry) {
            if (!array_key_exists('contactPointColumn', $entry)) {
                continue;
            }

            foreach ($remap as $sourceCPID => $targetCPID) {
                try {
                    DB::nonQuery(
                        'UPDATE `%s` SET `%s` = %u WHERE `%s` = %u',
                        [$entry['table'], $entry['contactPointColumn'], $targetCPID, $entry['contactPointColumn'], $sourceCPID]
                    );
                } catch (TableNotFoundException) {
                    break; // absent table == zero rows to remap
                }
            }
        }
    }

    // ------------------------------------------------------------------
    // Custom movers -- operate on live ActiveRecord instances so
    // VersionedRecord history and Person primary-contact bookkeeping stay
    // correct. Row counts per person are always small for these tables.
    // ------------------------------------------------------------------

    /**
     * @return array{moved:int, deduped:int, remap:array<int,int>}
     */
    public static function mergeContactPoints(Person $Source, Person $Target, bool $dryRun): array
    {
        $moved = 0;
        $deduped = 0;
        $remap = [];
        $targetID = static::personID($Target);

        foreach (AbstractPoint::getAllByWhere(['PersonID' => static::personID($Source)]) as $SourcePoint) {
            $Duplicate = AbstractPoint::getByWhere([
                'PersonID' => $targetID,
                'Class' => $SourcePoint->getValue('Class'),
                'Data' => $SourcePoint->getValue('Data'),
            ]);

            if ($Duplicate !== null) {
                $deduped++;
                if (!$dryRun) {
                    $remap[(int) $SourcePoint->getValue('ID')] = (int) $Duplicate->getValue('ID');
                    $SourcePoint->destroy();
                }
            } else {
                $moved++;
                if (!$dryRun) {
                    $SourcePoint->setFields(['PersonID' => $targetID]);
                    $SourcePoint->save();
                }
            }
        }

        return ['moved' => $moved, 'deduped' => $deduped, 'remap' => $remap];
    }

    public static function mergeRelationships(Person $Source, Person $Target, bool $dryRun): array
    {
        $moved = 0;
        $deduped = 0;
        $sourceID = static::personID($Source);
        $targetID = static::personID($Target);

        // relationships where source is the subject
        foreach (Relationship::getAllByWhere(['PersonID' => $sourceID]) as $Rel) {
            $relatedPersonID = (int) $Rel->getValue('RelatedPersonID');

            if ($relatedPersonID === $targetID) {
                // would become a self-relationship after remap
                $deduped++;
                if (!$dryRun) {
                    $Rel->destroy();
                }
                continue;
            }

            if (Relationship::getByWhere(['PersonID' => $targetID, 'RelatedPersonID' => $relatedPersonID]) !== null) {
                $deduped++;
                if (!$dryRun) {
                    $Rel->destroy();
                }
            } else {
                $moved++;
                if (!$dryRun) {
                    $Rel->setFields(['PersonID' => $targetID]);
                    $Rel->save();
                }
            }
        }

        // relationships where source is the related person (other side's rows)
        foreach (Relationship::getAllByWhere(['RelatedPersonID' => $sourceID]) as $Rel) {
            $personID = (int) $Rel->getValue('PersonID');

            if ($personID === $targetID) {
                $deduped++;
                if (!$dryRun) {
                    $Rel->destroy();
                }
                continue;
            }

            if (Relationship::getByWhere(['PersonID' => $personID, 'RelatedPersonID' => $targetID]) !== null) {
                $deduped++;
                if (!$dryRun) {
                    $Rel->destroy();
                }
            } else {
                $moved++;
                if (!$dryRun) {
                    $Rel->setFields(['RelatedPersonID' => $targetID]);
                    $Rel->save();
                }
            }
        }

        return ['moved' => $moved, 'deduped' => $deduped];
    }

    /**
     * Moves connector mappings, dropping exact (Connector, ExternalKey,
     * ExternalIdentifier) duplicates, and derives follow-up actions (via
     * MappingActionDeriverRegistry) for connectors present on both sides.
     */
    public static function mergeConnectorMappings(Person $Source, Person $Target, bool $dryRun): array
    {
        $moved = 0;
        $deduped = 0;
        $actions = [];

        $targetID = static::personID($Target);
        $rootClass = Person::getRootClass();
        $sourceMappings = Mapping::getAllByWhere(['ContextClass' => $rootClass, 'ContextID' => static::personID($Source)]);
        $targetMappings = Mapping::getAllByWhere(['ContextClass' => $rootClass, 'ContextID' => $targetID]);

        $targetByKey = [];
        foreach ($targetMappings as $TM) {
            $targetByKey[$TM->getValue('Connector').':'.$TM->getValue('ExternalKey')][] = $TM;
        }

        foreach ($sourceMappings as $SM) {
            $sourceIdentifier = $SM->getValue('ExternalIdentifier');
            $duplicate = null;

            foreach ($targetByKey[$SM->getValue('Connector').':'.$SM->getValue('ExternalKey')] ?? [] as $TM) {
                if ($TM->getValue('ExternalIdentifier') === $sourceIdentifier) {
                    $duplicate = $TM;
                    break;
                }
            }

            if ($duplicate !== null) {
                $deduped++;
                if (!$dryRun) {
                    $SM->destroy();
                }
            } else {
                $moved++;
                if (!$dryRun) {
                    $SM->setFields(['ContextID' => $targetID]);
                    $SM->save();
                }
            }
        }

        if (!$dryRun) {
            $actions = static::deriveMappingActions($Source, $Target, $sourceMappings, $targetMappings);
        }

        return ['moved' => $moved, 'deduped' => $deduped, 'actions' => $actions];
    }

    protected static function deriveMappingActions(Person $Source, Person $Target, array $sourceMappings, array $targetMappings): array
    {
        $actions = [];

        $sourceConnectors = array_unique(array_map(fn ($m) => $m->getValue('Connector'), $sourceMappings));
        $targetConnectors = array_unique(array_map(fn ($m) => $m->getValue('Connector'), $targetMappings));

        foreach (array_intersect($sourceConnectors, $targetConnectors) as $connector) {
            $deriver = MappingActionDeriverRegistry::get($connector);
            if ($deriver === null) {
                continue;
            }

            $sourceForConnector = array_values(array_filter($sourceMappings, fn ($m) => $m->getValue('Connector') === $connector));
            $targetForConnector = array_values(array_filter($targetMappings, fn ($m) => $m->getValue('Connector') === $connector));

            foreach ((array) call_user_func($deriver, $Source, $Target, $sourceForConnector, $targetForConnector) as $spec) {
                $actions[] = [
                    'type' => $spec['type'],
                    'connector' => $connector,
                    'payload' => $spec['payload'] ?? [],
                ];
            }
        }

        return $actions;
    }

    protected static function previewFollowUpActions(Person $Source, Person $Target): array
    {
        $rootClass = Person::getRootClass();
        $sourceMappings = Mapping::getAllByWhere(['ContextClass' => $rootClass, 'ContextID' => static::personID($Source)]);
        $targetMappings = Mapping::getAllByWhere(['ContextClass' => $rootClass, 'ContextID' => static::personID($Target)]);

        $actions = static::deriveMappingActions($Source, $Target, $sourceMappings, $targetMappings);

        foreach ($actions as &$action) {
            $action['hasExecutor'] = ActionExecutorRegistry::has($action['type']);
        }

        return $actions;
    }

    // ------------------------------------------------------------------
    // Snapshot + tombstone
    // ------------------------------------------------------------------

    protected static function snapshotIdentity(Person $Source): array
    {
        $fields = ['FirstName', 'LastName', 'MiddleName', 'PreferredName', 'NameSuffix', 'Gender', 'BirthDate'];
        if ($Source::fieldExists('Username')) {
            $fields[] = 'Username';
        }
        if ($Source::fieldExists('AccountLevel')) {
            $fields[] = 'AccountLevel';
        }
        if ($Source::fieldExists('StudentNumber')) {
            $fields[] = 'StudentNumber';
        }

        $snapshot = ['Class' => $Source->getValue('Class')];
        foreach ($fields as $field) {
            $snapshot[$field] = $Source->getValue($field);
        }

        return $snapshot;
    }

    protected static function tombstoneSource(Person $Source): ?string
    {
        $tombstoneUsername = null;

        if ($Source::fieldExists('Username') && $Source->getValue('Username')) {
            $tombstoneUsername = $Source->getValue('Username').'-merged-'.static::personID($Source);
            $Source->setFields(['Username' => $tombstoneUsername]);
        }

        if ($Source::fieldExists('AccountLevel')) {
            $Source->setFields(['AccountLevel' => 'Disabled']);
        }

        $Source->save();

        return $tombstoneUsername;
    }

    /**
     * Typed accessor for Person::ID -- see the class docblock for why this
     * goes through getValue() instead of the usual `$Person->ID` shorthand.
     */
    protected static function personID(Person $Person): int
    {
        return (int) $Person->getValue('ID');
    }

    /**
     * Typed accessor for ActiveRecord::ID on records this class doesn't
     * otherwise annotate for direct property access (MergeAudit).
     */
    protected static function recordID(MergeAudit $Record): int
    {
        return (int) $Record->getValue('ID');
    }

    /**
     * Transitions the queued candidate pair $candidateID (when supplied and
     * still findable) to merged, linked to $Audit -- the only path by which
     * a candidate pair ever reaches Candidate::STATUS_MERGED. A no-op when
     * $candidateID is null/empty or the record can't be found (a stale or
     * bogus ID shouldn't block or fail the merge itself).
     *
     * @param mixed $candidateID
     */
    protected static function linkCandidate($candidateID, MergeAudit $Audit): void
    {
        if ($candidateID === null || $candidateID === '') {
            return;
        }

        $Candidate = Candidate::getByID($candidateID);
        if ($Candidate === null) {
            return;
        }

        $Candidate->markMerged($Audit);
        $Candidate->save();
    }
}
