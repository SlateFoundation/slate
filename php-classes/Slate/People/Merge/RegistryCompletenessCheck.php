<?php

namespace Slate\People\Merge;

use DB;

/**
 * Scans information_schema for columns that look like person references and
 * cross-checks them against MergeRegistry, so a new person-linked table
 * landing without a registry entry fails CI instead of quietly evading a
 * merge. Wired up as a PHPUnit test (RegistryCompletenessTest).
 *
 * @see specs/behaviors/person-merge.md#verification
 */
class RegistryCompletenessCheck
{
    /**
     * Column names treated as strong signals that a column references a
     * person. Deliberately excludes the universal ActiveRecord attribution
     * columns CreatorID/ModifierID -- every ActiveRecord table has these
     * (see ActiveRecord::$fields), so treating them as "must be
     * registered" would pull the entire schema into the registry and
     * contradicts the curated inventory this registry is seeded from
     * (site-root/powertools/user-data-report.php only tracks CreatorID
     * where authorship is substantively about the person, e.g.
     * media.CreatorID -- which is registered explicitly). Bare ContextID
     * is excluded for the same reason: it's polymorphic and only means
     * "person" on specific tables, which are also registered explicitly.
     *
     * This is a known, documented scope limit (see the plan's Risks /
     * unknowns) -- a legacy or future table linking a person through an
     * unconventional column name can still evade this scan.
     */
    protected const PERSON_COLUMN_NAMES = [
        'PersonID', 'RelatedPersonID', 'RecipientID', 'StudentID',
        'AdvisorID', 'AuthorID', 'EmailContactID',
    ];

    /**
     * history_* shadow tables mirror their live table's columns 1:1 and
     * aren't merge targets themselves; this module's own audit/action
     * tables reference people by design, not as merge-registry candidates.
     */
    protected const EXCLUDED_TABLE_PREFIXES = ['history_'];
    protected const EXCLUDED_TABLES = ['merge_audits', 'merge_followup_actions'];

    /**
     * @return array<int, array{table: string, column: string}> columns that
     *         look like person references but aren't covered by any
     *         MergeRegistry entry
     */
    public static function findUnregisteredColumns(): array
    {
        $registered = static::getRegisteredTableColumnPairs();

        $quotedNames = implode(',', array_map(
            fn ($name) => '"'.DB::escape($name).'"',
            static::PERSON_COLUMN_NAMES
        ));

        $rows = DB::allRecords(
            'SELECT TABLE_NAME, COLUMN_NAME
               FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = SCHEMA()
                AND COLUMN_NAME IN (%s)',
            [$quotedNames]
        );

        $unregistered = [];

        foreach ($rows as $row) {
            $table = $row['TABLE_NAME'];
            $column = $row['COLUMN_NAME'];

            if (in_array($table, static::EXCLUDED_TABLES, true)) {
                continue;
            }

            $excluded = false;
            foreach (static::EXCLUDED_TABLE_PREFIXES as $prefix) {
                if (str_starts_with((string) $table, (string) $prefix)) {
                    $excluded = true;
                    break;
                }
            }
            if ($excluded) {
                continue;
            }

            if (!isset($registered[$table.'.'.$column])) {
                $unregistered[] = ['table' => $table, 'column' => $column];
            }
        }

        return $unregistered;
    }

    /**
     * @return array<string, true> keyed by "table.column"
     */
    protected static function getRegisteredTableColumnPairs(): array
    {
        $pairs = [];

        foreach (MergeRegistry::getEntries() as $entry) {
            if (array_key_exists('table', $entry)) {
                $column = array_key_exists('contextClass', $entry) ? 'ContextID' : ($entry['column'] ?? null);
                if ($column !== null) {
                    $pairs[$entry['table'].'.'.$column] = true;
                }

                if (array_key_exists('contactPointColumn', $entry)) {
                    $pairs[$entry['table'].'.'.$entry['contactPointColumn']] = true;
                }
            }
        }

        // custom movers (contact points, relationships, connector mappings)
        // aren't table/column-shaped registry entries -- reviewed by hand
        $pairs['contact_points.PersonID'] = true;
        $pairs['relationships.PersonID'] = true;
        $pairs['relationships.RelatedPersonID'] = true;
        $pairs['connector_mappings.ContextID'] = true;

        return $pairs;
    }
}
