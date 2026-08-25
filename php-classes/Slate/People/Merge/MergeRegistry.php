<?php

namespace Slate\People\Merge;

use Emergence\People\Person;
use Emergence\People\Invitation;
use Emergence\People\Groups\GroupMember;
use Emergence\Comments\Comment;
use Emergence\CMS\AbstractContent;
use Emergence\CRM\Message;
use Emergence\CRM\MessageRecipient;
use Emergence\Connectors\Mapping;
use Slate\Courses\SectionParticipant;
use Slate\Progress\SectionInterimReport;
use Slate\Progress\SectionInterimReportRecipient;
use Slate\Progress\SectionTermReport;
use Slate\Progress\SectionTermReportRecipient;

/**
 * Declarative registry of tables that hold rows keyed to a person, walked by
 * Merge when consolidating a source person's data onto a target. Slate
 * registers the core tables below; connectors/modules add their own via
 * register().
 *
 * Entry shapes:
 *
 *   - Simple reassignment:
 *       ['table' => ..., 'column' => 'PersonID']
 *
 *   - Reassignment with dedupe (the person column plus 'uniqueColumns'
 *     together form a uniqueness constraint on the table; a source row whose
 *     other-column values already exist on a target row is dropped instead
 *     of moved):
 *       ['table' => ..., 'column' => 'PersonID', 'uniqueColumns' => [...]]
 *
 *   - Polymorphic context tables (ContextClass/ContextID pattern): set
 *     'contextClass' instead of 'column'; the walker uses the ContextID
 *     column scoped to `ContextClass = <contextClass>`.
 *
 *   - Fully custom tables (contact points, relationships, connector
 *     mappings): set 'mover' to a callable with signature
 *       function (Person $Source, Person $Target, bool $dryRun): array
 *     returning ['moved' => int, 'deduped' => int]. Custom movers operate on
 *     live ActiveRecord instances (not raw SQL) so framework bookkeeping
 *     (VersionedRecord history, Person::PrimaryEmailID/etc.) stays correct;
 *     they're used here for the handful of tables with cross-row semantics
 *     beyond a column swap.
 *
 * Every entry may carry a human-readable 'label' for preview/audit display.
 */
class MergeRegistry
{
    protected static array $entries = [];
    protected static bool $defaultsRegistered = false;

    /**
     * Register (or override) a merge registry entry. Connectors and modules
     * call this to add their own person-keyed tables.
     */
    public static function register(string $key, array $entry): void
    {
        static::ensureDefaults();
        static::$entries[$key] = $entry;
    }

    /**
     * @return array<string, array> keyed by registry key
     */
    public static function getEntries(): array
    {
        static::ensureDefaults();
        return static::$entries;
    }

    public static function getEntry(string $key): ?array
    {
        static::ensureDefaults();
        return static::$entries[$key] ?? null;
    }

    /**
     * Test-only: remove a registered entry (e.g. a fixture entry registered
     * to force a failure mid-merge).
     */
    public static function unregister(string $key): void
    {
        unset(static::$entries[$key]);
    }

    protected static function ensureDefaults(): void
    {
        if (static::$defaultsRegistered) {
            return;
        }

        static::$defaultsRegistered = true;

        foreach (static::getDefaultEntries() as $key => $entry) {
            if (!isset(static::$entries[$key])) {
                static::$entries[$key] = $entry;
            }
        }
    }

    /**
     * Core Slate registry, seeded from site-root/powertools/user-data-report.php
     * plus sessions and connector_mappings (per plans/person-merge-engine.md).
     */
    protected static function getDefaultEntries(): array
    {
        return [
            'core.enrollments' => [
                'label' => 'Enrollments',
                'table' => SectionParticipant::$tableName,
                'column' => 'PersonID',
                'uniqueColumns' => ['CourseSectionID'],
            ],
            'core.comments' => [
                'label' => 'Comments',
                'table' => Comment::$tableName,
                'column' => 'CreatorID',
            ],
            'core.content-creator' => [
                'label' => 'Content Created',
                'table' => AbstractContent::$tableName,
                'column' => 'CreatorID',
            ],
            'core.content-author' => [
                'label' => 'Content Authored',
                'table' => AbstractContent::$tableName,
                'column' => 'AuthorID',
            ],
            'core.groups' => [
                'label' => 'Group Memberships',
                'table' => GroupMember::$tableName,
                'column' => 'PersonID',
                'uniqueColumns' => ['GroupID'],
            ],
            'core.invitations' => [
                'label' => 'Invitations',
                'table' => Invitation::$tableName,
                'column' => 'RecipientID',
            ],
            'core.media-creator' => [
                'label' => 'Media Created',
                'table' => \Media::$tableName,
                'column' => 'CreatorID',
            ],
            'core.media-context' => [
                'label' => 'Media Context',
                'table' => \Media::$tableName,
                'contextClass' => Person::class,
            ],
            'core.messages-creator' => [
                'label' => 'Messages Created',
                'table' => Message::$tableName,
                'column' => 'CreatorID',
            ],
            'core.messages-author' => [
                'label' => 'Messages Authored',
                'table' => Message::$tableName,
                'column' => 'AuthorID',
            ],
            // notes/messages *about* the person -- not in the original
            // user-data-report.php inventory, but Message's ContextClass is
            // exclusively Person::class (see Message::$fields), so a
            // tombstoned source must not keep notes attached to it either.
            'core.messages-context' => [
                'label' => 'Notes About Person',
                'table' => Message::$tableName,
                'contextClass' => Person::class,
            ],
            'core.message-recipients' => [
                'label' => 'Messages Received',
                'table' => MessageRecipient::$tableName,
                'column' => 'PersonID',
            ],
            'core.interim-reports' => [
                'label' => 'Interim Reports',
                'table' => SectionInterimReport::$tableName,
                'column' => 'StudentID',
                'uniqueColumns' => ['SectionID', 'TermID'],
            ],
            'core.interim-report-recipients' => [
                'label' => 'Interim Reports Sent',
                'table' => SectionInterimReportRecipient::$tableName,
                'column' => 'StudentID',
                'uniqueColumns' => ['TermID', 'EmailContactID'],
                // EmailContactID references contact_points.ID directly; when
                // a duplicate contact point is dropped during the contact
                // points merge step, references here are remapped to the
                // surviving contact point (see Merge::remapContactPointReferences)
                'contactPointColumn' => 'EmailContactID',
            ],
            'core.term-reports' => [
                'label' => 'Term Reports',
                'table' => SectionTermReport::$tableName,
                'column' => 'StudentID',
                'uniqueColumns' => ['SectionID', 'TermID'],
            ],
            'core.term-report-recipients' => [
                'label' => 'Term Reports Sent',
                'table' => SectionTermReportRecipient::$tableName,
                'column' => 'StudentID',
                'uniqueColumns' => ['TermID', 'EmailContactID'],
                'contactPointColumn' => 'EmailContactID',
            ],
            'core.tags' => [
                'label' => 'Tags',
                'table' => \TagItem::$tableName,
                'contextClass' => Person::class,
                'uniqueColumns' => ['TagID'],
            ],
            'core.sessions' => [
                'label' => 'Sessions',
                'table' => \Session::$tableName,
                'column' => 'PersonID',
            ],
            // custom movers: operate on live ActiveRecord instances so
            // VersionedRecord history and Person primary-contact bookkeeping
            // stay correct; see Merge::mergeContactPoints/Relationships/Mappings
            'core.contact-points' => [
                'label' => 'Contact Points',
                'mover' => Merge::mergeContactPoints(...),
                // run after every other entry: report-recipient tables'
                // EmailContactID references (see 'contactPointColumn' above)
                // must be remapped once we know which duplicates got dropped
                'runLast' => true,
            ],
            'core.relationships' => [
                'label' => 'Relationships',
                'mover' => Merge::mergeRelationships(...),
            ],
            'core.connector-mappings' => [
                'label' => 'Connector Mappings',
                'mover' => Merge::mergeConnectorMappings(...),
            ],
        ];
    }
}
