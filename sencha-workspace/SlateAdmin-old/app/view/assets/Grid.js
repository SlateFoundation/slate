/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.assets.Grid', {
    extend: 'Ext.grid.Panel',
    xtype: 'assets-grid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.selection.CheckboxModel'
    ],

    //voids clicks inside of checkbox column that are not on checkbox itself.
    listeners: {
        cellclick: function (sender, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            var clickedColIndex = null;
            
            if (Ext.fly(e.target).hasCls('x-grid-row-checker')) {                
                return;
            }
            
            clickedColIndex = cellIndex;
        },
        beforedeselect: function (rowmodel, record, index, eOpts) {
           var clickedColIndex = clickedColIndex || -1;
           return (clickedColIndex !== 0);
        }
    },

    // people-grid config
    exportItems: null,
    firstRefill: true,
    exportFieldsLoaded: false,
    pendingCheckedFields: false,

    initComponent: function() {
        var me = this,
            batchStatusBtn, batchStatusStore,
            batchLocationBtn, batchLocationStore,
            _onBatchStoreLoad;
        
        me.callParent(arguments);
        
        me.addEvents('batchlocationupdate', 'batchstatusupdate');
        
        _onBatchStoreLoad = function(store, btn) {
            
            Ext.each(store.data.items, function(record, i, statuses) {
                btn.menu.add({
                    text: record.get('Title'),
                    record: record
                });
            }, me);
            
            btn.enable();   
        };
        
        me.batchStatusStore = batchStatusStore = new Ext.data.Store({
            model: 'SlateAdmin.model.asset.Status'
        });
        
        me.batchLocationStore = batchLocationStore = new Ext.data.Store({
            model: 'SlateAdmin.model.asset.Location'
        });
        
        me.batchStatusBtn = batchStatusBtn = me.down('#batchStatus');
        
        me.batchLocationBtn = batchLocationBtn = me.down('#batchLocation');
        
        if (!batchStatusStore.isLoaded()) {
            me.batchStatusBtn.disable();
            
            batchStatusStore.on('load', function() {
                return _onBatchStoreLoad(me.batchStatusStore, me.batchStatusBtn);
            }, me);
            
            if (!batchStatusStore.isLoading()) {
                batchStatusStore.load();
            }
        }
        
        if (!batchLocationStore.isLoaded()) {
            me.batchLocationBtn.disable();
            
            batchLocationStore.on('load', function() {
                return _onBatchStoreLoad(me.batchLocationStore, me.batchLocationBtn);
            }, me);
            
            if (!batchLocationStore.isLoading()) {
                batchLocationStore.load();
            }
        }
        
        batchStatusBtn.menu.on('click', function(menu, item) {
            if (item) {
                this.fireEvent('batchstatusupdate', me, menu, item);
            }
        }, me);
        
        batchLocationBtn.menu.on('click', function(menu, item) {
            if (item) {
                this.fireEvent('batchlocationupdate', me, menu, item);
            }
        }, me);
    },

    // grid config
    store: 'Assets',
    columnLines: true,
    viewConfig: {
        emptyText: 'No assets.',
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
        itemId: 'addAsset',
        text: 'Add New Asset',
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
            items: []
        }
    },{
        text: 'Set Location',
        itemId: 'batchLocation',
        bulkOnly: true,
        disabled: true, // should be disabled/enabled based on whether there is a selection
        glyph: 0xf041, // fa-map-marker
        menu: {
            plain: true,
            items: []
        }
    }],

    columns: {
        defaults: {
            menuDisabled: true
        },
        items: [{
            text: 'Serial',
            flex: 1,
            dataIndex: 'MfrSerial',
            xtype: 'templatecolumn',
            tpl: '<tpl for="Aliases"><tpl if="Type == &quot;MfrSerial&quot;">{Identifier}</tpl></tpl>'
        },
//        {
//            text: 'MAC',
//            flex: 2,
//            dataIndex: 'MacAddress',
//            xtype: 'templatecolumn',
//            tpl: '<tpl for="Aliases"><tpl if="Type == &quot;MacAddress&quot;">{Identifier}</tpl></tpl>'
//        },
        {
            text: 'Assignee',
            flex: 1,
            dataIndex: 'Assignee',
            xtype: 'templatecolumn',
            tpl: '<tpl for="Assignee">{FirstName} {LastName}</tpl>'
        },{
            text: 'Status',
            dataIndex: 'Status',
            flex: 1,
            xtype: 'templatecolumn',
            tpl: '<tpl for="Status">{Title}</tpl>'
        },{
            text: 'Location',
            dataIndex: 'Location',
            flex: 2,
            xtype: 'templatecolumn',
            tpl: '<tpl for="Location">{Title}</tpl>'
        }]
    }
});
