/**
 * Duplicate-candidate queue grid: status filter, detector + score columns,
 * and both person summaries per row. Row selection drives the compare view
 * (see the MergeQueue controller).
 */
Ext.define('SlateAdmin.view.mergequeue.CandidatesGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'mergequeue-candidates-grid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.grid.column.Number'
    ],


    // grid config
    store: 'mergequeue.Candidates',
    viewConfig: {
        emptyText: 'No duplicate candidates match this filter',
        deferEmptyText: false
    },

    tbar: [{
        xtype: 'tbtext',
        text: 'Status:'
    }, {
        xtype: 'combobox',
        itemId: 'statusField',
        editable: false,
        queryMode: 'local',
        valueField: 'value',
        displayField: 'text',
        value: 'open',
        width: 140,
        store: {
            fields: ['value', 'text'],
            data: [
                { value: 'open', text: 'Open' },
                { value: 'merged', text: 'Merged' },
                { value: 'dismissed', text: 'Dismissed' },
                { value: 'deferred', text: 'Deferred' },
                { value: 'all', text: 'All' }
            ]
        }
    }],

    columns: {
        defaults: {
            menuDisabled: true,
            sortable: false
        },
        items: [{
            text: 'Detector',
            dataIndex: 'Detector',
            width: 150
        }, {
            text: 'Score',
            dataIndex: 'Score',
            xtype: 'numbercolumn',
            format: '0.00',
            width: 70
        }, {
            text: 'Person 1',
            dataIndex: 'Person1',
            xtype: 'templatecolumn',
            flex: 1,
            tpl: '<tpl if="Person1">{Person1.FirstName:htmlEncode} {Person1.LastName:htmlEncode} <span class="muted">({Person1.Username:htmlEncode})</span></tpl>'
        }, {
            text: 'Person 2',
            dataIndex: 'Person2',
            xtype: 'templatecolumn',
            flex: 1,
            tpl: '<tpl if="Person2">{Person2.FirstName:htmlEncode} {Person2.LastName:htmlEncode} <span class="muted">({Person2.Username:htmlEncode})</span></tpl>'
        }, {
            text: 'Status',
            dataIndex: 'Status',
            width: 90
        }]
    }
});
