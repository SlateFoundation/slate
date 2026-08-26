/**
 * Follow-up actions queue: pending (default) or historical actions spawned
 * by merges, with an execute button where an executor is registered for
 * the action's type, and manual complete/skip actions otherwise. Each
 * row's outcome history expands inline (see {@link #cfg-plugins}).
 */
Ext.define('SlateAdmin.view.mergequeue.ActionsManager', {
    extend: 'Ext.grid.Panel',
    xtype: 'mergequeue-actions-grid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.grid.plugin.RowExpander'
    ],


    // grid config
    store: 'mergequeue.FollowUpActions',
    viewConfig: {
        emptyText: 'No follow-up actions match this filter',
        deferEmptyText: false
    },

    plugins: [{
        ptype: 'rowexpander',
        rowBodyTpl: [
            '<div class="mergequeue-action-detail">',
            '    <tpl if="Payload">',
            '        <div class="mergequeue-action-payload"><strong>Payload:</strong> {[Ext.String.htmlEncode(Ext.encode(values.Payload))]}</div>',
            '    </tpl>',
            '    <tpl if="OutcomeLog && OutcomeLog.length">',
            '        <ul class="mergequeue-outcome-log">',
            '        <tpl for="OutcomeLog">',
            '            <li><strong>{status:htmlEncode}</strong> by {actorLabel:htmlEncode} at {timestamp:htmlEncode} &mdash; {notes:htmlEncode}</li>',
            '        </tpl>',
            '        </ul>',
            '    <tpl else>',
            '        <div class="muted">No outcomes recorded yet.</div>',
            '    </tpl>',
            '</div>'
        ]
    }],

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
        value: 'pending',
        width: 140,
        store: {
            fields: ['value', 'text'],
            data: [
                { value: 'pending', text: 'Pending' },
                { value: 'completed', text: 'Completed' },
                { value: 'skipped', text: 'Skipped' },
                { value: 'failed', text: 'Failed' },
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
            text: 'Type',
            dataIndex: 'Type',
            width: 180
        }, {
            text: 'Connector',
            dataIndex: 'Connector',
            width: 120
        }, {
            text: 'Linked Merge',
            dataIndex: 'MergeAudit',
            xtype: 'templatecolumn',
            flex: 1,
            tpl: [
                '<tpl if="MergeAudit">',
                '    <tpl if="MergeAudit.SourcePerson">',
                '        {MergeAudit.SourcePerson.FirstName:htmlEncode} {MergeAudit.SourcePerson.LastName:htmlEncode}',
                '        &rarr;',
                '        {MergeAudit.TargetPerson.FirstName:htmlEncode} {MergeAudit.TargetPerson.LastName:htmlEncode}',
                '    <tpl else>',
                '        Merge #{MergeAudit.ID}',
                '    </tpl>',
                '<tpl else>',
                '    &mdash;',
                '</tpl>'
            ]
        }, {
            text: 'Executable',
            dataIndex: 'hasExecutor',
            width: 90,
            renderer: function(hasExecutor) {
                return hasExecutor ? 'Executor' : 'Manual';
            }
        }, {
            text: 'Status',
            dataIndex: 'Status',
            width: 90
        }, {
            xtype: 'actioncolumn',
            width: 100,
            align: 'end',
            items: [{
                action: 'execute',
                glyph: 0xf04b, // fa-play
                tooltip: 'Run executor',
                isDisabled: function(view, rowIndex, colIndex, item, record) {
                    return !(record.get('hasExecutor') && record.get('Status') === 'pending');
                }
            }, {
                action: 'complete',
                iconCls: 'glyph-success',
                glyph: 0xf00c, // fa-check
                tooltip: 'Mark complete&hellip;',
                isDisabled: function(view, rowIndex, colIndex, item, record) {
                    return record.get('Status') === 'completed';
                }
            }, {
                action: 'skip',
                iconCls: 'glyph-danger',
                glyph: 0xf05e, // fa-ban
                tooltip: 'Skip&hellip;',
                isDisabled: function(view, rowIndex, colIndex, item, record) {
                    return record.get('Status') === 'completed';
                }
            }]
        }]
    }
});
