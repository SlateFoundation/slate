/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.tickets.Grid', {
    extend: 'Ext.grid.Panel',
    xtype: 'tickets-grid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.selection.CheckboxModel'
    ],

    //cancels clicks inside of checkbox column that are not on checkbox itself.
    listeners: {
        cellclick: function (sender, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            var clickedColIndex = null;
            
            if (Ext.fly(e.target).hasCls('x-grid-row-checker')) {
                return;
            }
            clickedColIndex = cellIndex;
        },
        beforedeselect: function (rowmodel, record, index, eOpts) {
           var clickedColIndex = clickedColIndex || null;
           return (clickedColIndex !== 0);
        }
    },
    
    initComponent: function() {
        var me = this,
            batchStatusBtn;
        
        me.callParent(arguments);
        
        
        me.batchStatusBtn = batchStatusBtn = me.down('#batchStatus');
        
        batchStatusBtn.menu.on('click', function(menu, item) {
            if (item) {
                this.fireEvent('batchstatusupdate', me, menu, item);
            }
        }, me);
    },

    // ticket-grid config
    exportItems: null,
    firstRefill: true,
    exportFieldsLoaded: false,
    pendingCheckedFields: false,

    // grid config
    store: 'assets.Tickets',
    columnLines: true,
    viewConfig: {
        emptyText: 'No tickets.',
        deferEmptyText: false,
        forceFit: true
    },
    selType: 'checkboxmodel',
    multiSelect: true,
    selModel: {
        pruneRemoved: false
    },
    
    border: false,

    bbar: [{
        xtype: 'button',
        itemId: 'addTicket',
        text: 'Add New Ticket',
        glyph: 0xf055, // fa-plus-circle
        cls: 'glyph-success'
    },{
        xtype: 'tbfill'
    },{
        xtype: 'tbtext',
        cls: 'muted',
        text: '',
        itemId: 'selectionCount'
    },{
        text: 'Set Status',
        itemId: 'batchStatus',
        bulkOnly: true,
        disabled: true, // should be disabled/enabled based on whether there is a selection
        glyph: 0xf02b, // fa-tag
        menu: {
            plain: true,
            items: [{
                text: 'Open'
            },{
                text: 'Closed'
            }]
        }
    }],

    columns: {
        defaults: {
            menuDisabled: true
        },
        items: [{
            text: 'ID',
            flex: 1,
            dataIndex: 'ID'
        },{
            text: 'Assignee',
            flex: 4,
            dataIndex: 'Assignee',
            xtype: 'templatecolumn',
            tpl: '<tpl for="Assignee">{FirstName} {LastName}</tpl>'
        },{
            text: 'Status',
            dataIndex: 'Status',
            flex: 4
        }]
    }
});
