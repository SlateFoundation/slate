<?php

declare(strict_types=1);

namespace Slate\People\Merge;

use Emergence\People\Person;

/**
 * Durable audit trail for a completed person merge: source and target IDs,
 * a snapshot of the source's identity fields, per-table counts of rows
 * moved/deduped, and (via the inherited CreatorID/Created fields) who
 * executed it and when.
 *
 * @property int $ID
 * @property string $Class
 * @property int $SourcePersonID
 * @property int $TargetPersonID
 * @property string|null $TombstoneUsername
 * @property array|null $SourceSnapshot
 * @property array|null $TableCounts
 * @property int|null $CandidateID
 * @property Person|null $SourcePerson
 * @property Person|null $TargetPerson
 * @property FollowUpAction[] $FollowUpActions
 *
 * @see specs/behaviors/person-merge.md#merge-semantics
 */
class MergeAudit extends \ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'merge_audits';
    public static $singularNoun = 'merge audit';
    public static $pluralNoun = 'merge audits';
    public static $collectionRoute = '/people/merge/audits';

    // required for shared-table subclassing support
    public static $rootClass = self::class;
    public static $defaultClass = self::class;
    public static $subClasses = [self::class];

    public static $fields = [
        'SourcePersonID' => [
            'type' => 'integer',
            'unsigned' => true,
        ],
        'TargetPersonID' => [
            'type' => 'integer',
            'unsigned' => true,
        ],
        'TombstoneUsername' => [
            'type' => 'string',
            'notnull' => false,
        ],
        'SourceSnapshot' => [
            'type' => 'json',
            'notnull' => false,
        ],
        'TableCounts' => [
            'type' => 'json',
            'notnull' => false,
        ],
        'CandidateID' => [
            'type' => 'integer',
            'unsigned' => true,
            'notnull' => false,
            'description' => 'Links to the duplicate-candidate pair this merge resolved, when applicable',
        ],
    ];

    public static $relationships = [
        'SourcePerson' => [
            'type' => 'one-one',
            'class' => Person::class,
            'local' => 'SourcePersonID',
        ],
        'TargetPerson' => [
            'type' => 'one-one',
            'class' => Person::class,
            'local' => 'TargetPersonID',
        ],
        'FollowUpActions' => [
            'type' => 'one-many',
            'class' => FollowUpAction::class,
            'foreign' => 'MergeAuditID',
        ],
    ];

    public static $dynamicFields = [
        'SourcePerson',
        'TargetPerson',
        'FollowUpActions',
    ];

    public static $indexes = [
        // a person can only ever be the source of one merge -- once
        // tombstoned it can't be re-merged as a source, and this index is
        // also how execute() finds the prior audit for a repeated request
        'SourcePerson' => [
            'fields' => ['SourcePersonID'],
            'unique' => true,
        ],
    ];

    public static function getByPreviousSource($personID)
    {
        return static::getByField('SourcePersonID', $personID);
    }
}
