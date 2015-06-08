Ext.define('SlateAdmin.view.assets.TicketsGrid', {
    extend: 'Ext.grid.Panel',
    
    requires: [
        'Ext.grid.plugin.RowEditing',
        'SlateAdmin.proxy.Records'
    ],
    
    xtype: 'assets-ticketsgrid',
    
    title: 'Asset Tickets',
    config: {
        asset: null
    },
    
    autoScroll: true,
    height: 200,
    
    tbar: [{
        text: 'Create Ticket',
        cls: 'glyph-success',
        glyph: 0xf055, // fa-plus-circle
        handler: function(btn) {
            var grid = this.up('grid'),
                rowEditor = grid.getPlugin('ticketeditor'),
                newTicket = new SlateAdmin.model.asset.Ticket({Status: 'Open'});
            
            rowEditor.cancelEdit();
            
            grid.getStore().insert(0, newTicket);
            grid.getSelectionModel().select(0);
            
            rowEditor.startEdit(0);
//            debugger;
        }
    }],
    
    columns: {
        defaults: {
            menuDisabled: true
        },
        
        items: [{
            width: 50,
            xtype: 'templatecolumn',
            text: 'ID',
            dataIndex: 'ID',
            tpl: '<a href="#tickets/search/asset:{AssetID}/{ID}" class="ticket-link">{ID}</a>',
        },{
            text: 'Nickname',
            dataIndex: 'Name',
            editor: 'textfield'
        },{
            flex: 1,
            text: 'Description',
            dataIndex: 'Description',
            editor: 'textfield'
        },{
            text: 'Status',
            dataIndex: 'Status',
            hidden: true,
            editor: {
                xtype: 'combo',
                allowBlank: false,
                store: [
                    'Open', 'Closed'    
                ]
            }
        },{
            xtype: 'templatecolumn',
            text: 'Assignee',
            dataIndex: 'AssigneeID',
            tpl: '<tpl for="Assignee">{FirstName} {LastName}</tpl>',
            editor: {
                xtype: 'combo',
                store: 'people.People',
                displayField: 'FullName',
                valueField: 'ID',
                queryParam: 'q'
            }
        },{
            text: 'AssetID',
            dataIndex: 'AssetID',
            hidden: true
        }]
    },
    
    selType: 'rowmodel',
    
    plugins: [
        Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToEdit: 2,
            pluginId: 'ticketeditor'
        })
    ],
    
//    store: new Ext.data.SimpleStore(),
    emptyText: 'No tickets yet.',
    
    initComponent: function() {
        var me = this,
            rowEditor = me.getPlugin('ticketeditor'),
            col;
        
        me.addEvents('ticketsaved');
        
        me.callParent(arguments);
        
        col = me.columns[2];
        
        if (!col.editor.store) {
            col.editor.store = new Ext.data.Store({
                model: 'SlateAdmin.model.person.Person',
                autoLoad: true,
                proxy: {
                    type: 'slaterecords',
                    url: '/people'
                } 
            });
        }
        
        me.getView().on('click', function(ev, target) {
            ev.preventDefault();
            SlateAdmin.app.redirectTo(target.href);
        }, me, {delegate: 'a.ticket-link'});
        
        rowEditor.on('canceledit', me.onRowEditorCancelEdit, me);
        rowEditor.on('beforeedit', me.onBeforeEdit, me);
        rowEditor.on('edit', me.onRowEditorSave, me);
        
    },
    
    resetStore: function() {
        var me = this;
        me.bindStore(new Ext.data.SimpleStore({
            model: 'SlateAdmin.model.asset.Ticket'
        }), true);
    },
    
    bindStoreToAsset: function() {
        var me = this,
            asset = me.getAsset();
        
        if (!asset || (asset && asset.phantom)) {
            return me.resetStore();
        }
        
        me.bindStore(new Ext.data.Store({
            proxy: {
                type: 'slaterecords',
                url: '/assets/'+asset.getId()+'/tickets',
                api: {
                    
                    create: '/tickets/save',
                    read: '/assets/'+asset.getId()+'/tickets',
                    update: '/tickets/save'
                },
                reader: {
                    totalProperty: 'total',
                    successProperty: 'success',
                    root: 'data',
                    type: 'json'
                },
                
                extraParams: {
                    format: 'json',
                    include: 'Assignee'
                }
            },
//            autoSync: true,
            autoLoad: true,
            model: 'SlateAdmin.model.asset.Ticket'
        }));
    },
    
    updateAsset: function(asset, oldAsset) {
        var me = this;
        
        me.asset = asset;
        
        if (!asset) {
            me.disable();
        } else if (asset && asset.phantom) {
            me.disable();
        } else {
            me.enable();
        }
        
        me.bindStoreToAsset();
        
    },
    
    onBeforeEdit: function() {
        var me = this,
            peopleStore = Ext.getStore('people.People');
        
        if (!peopleStore.isLoaded()) {
            peopleStore.load();
        }
    },
    
    onRowEditorSave: function(editor, context) {
        var me = this,
            assetId = me.asset.getId(),
            ticketStore = Ext.getStore('assets.Tickets'),
            ticketIdx = ticketStore.find('ID', context.record.get('ID')),
            _onTicketSaveFailure = function() {
                return Ext.Msg.alert('Error', 'There was an error saving your changes, please try again.');
            },
            _onTicketSaveSuccess = function() {
                context.record.commit();
                me.fireEvent('ticketsaved', me, editor, context);
            };

        if (ticketIdx && ticketIdx !== -1) {
            ticket = ticketStore.getAt(ticketIdx);
            
            ticket.set(context.record.getData());
            ticket.save({
                callback: function(ticket, response, success) {
                    if (success) {
                        _onTicketSaveSuccess();
                    } else {
                        return _onTicketSaveFailure();
                    }
                },
                scope: me
            });
        
        } else {
            context.record.set('AssetID', assetId);
            context.record.save({
                callback: function(ticket, response, success) {
                    if (success) {
                        _onTicketSaveSuccess();
                    } else {
                        return _onTicketSaveFailure();
                    }
                },
                scope: me
            });
        }
    },
    
    onRowEditorCancelEdit: function(editor, context) {
        if (context.record.phantom) {
            context.record.store.removeAt(0);
        }
    }
});