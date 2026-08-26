/**
 * A durable follow-up action spawned by a merge -- a cross-system
 * implication that still needs doing outside Slate's own rows.
 *
 * @see specs/api/person-merge.md#get-peoplemergeactionsstatuspendingcompletedskippedfailed
 */
Ext.define('SlateAdmin.model.mergequeue.FollowUpAction', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.mergequeue.FollowUpActions'
    ],

    idProperty: 'ID',

    fields: [
        // ActiveRecord fields
        { name: 'ID', type: 'integer', allowNull: true },
        { name: 'Class', defaultValue: 'Slate\\People\\Merge\\FollowUpAction' },

        // entity fields
        { name: 'MergeAuditID', type: 'integer' },
        { name: 'Type', type: 'string' },
        { name: 'Connector', type: 'string' },
        { name: 'Payload', type: 'auto' },
        {
            name: 'Status',
            type: 'string',
            defaultValue: 'pending'
        },
        { name: 'OutcomeLog', type: 'auto' },

        // dynamic fields
        { name: 'MergeAudit', type: 'auto' },
        { name: 'hasExecutor', type: 'boolean', persist: false }
    ],

    proxy: 'mergequeue-followupactions'
});
