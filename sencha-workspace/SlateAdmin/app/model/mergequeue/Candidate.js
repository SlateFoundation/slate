/**
 * A detected duplicate-person candidate pair.
 *
 * @see specs/api/person-merge.md#get-peoplemergecandidatesstatusopenmergeddismisseddeferred
 */
Ext.define('SlateAdmin.model.mergequeue.Candidate', {
    extend: 'Ext.data.Model',
    idProperty: 'ID',

    fields: [
        // ActiveRecord fields
        { name: 'ID', type: 'integer', allowNull: true },
        { name: 'Class', defaultValue: 'Slate\\People\\Merge\\Candidate' },

        // entity fields
        { name: 'Person1ID', type: 'integer' },
        { name: 'Person2ID', type: 'integer' },
        { name: 'Detector', type: 'string' },
        { name: 'Score', type: 'number' },
        { name: 'Evidence', type: 'auto' },
        {
            name: 'Status',
            type: 'string',
            defaultValue: 'open'
        },
        { name: 'MergeAuditID', type: 'integer', allowNull: true },
        { name: 'DecisionLog', type: 'auto' },

        // optional includes -- both person summaries, always requested
        { name: 'Person1', type: 'auto' },
        { name: 'Person2', type: 'auto' }
    ],

    proxy: {
        type: 'slate-records',
        url: '/people/merge/candidates'
    }
});
