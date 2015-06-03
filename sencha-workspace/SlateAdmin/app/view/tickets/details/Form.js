Ext.define('SlateAdmin.view.tickets.details.Form', {
    extend: 'Ext.form.Panel',

    xtype: 'tickets-details-form',
    
    title: 'Ticket Details',
    collapsible: true,
    titleCollapse: true,
    
    config: {
        selectedTicket: null  
    },
    
    header: {
        border: '0 0 1'
    },

    dockedItems: [{
        xtype: 'toolbar',
        disabled: true,
        border: '1 0',
        items: [{
            text: 'Cancel',
            cls: 'glyph-danger',
            itemId: 'tickets-details-cancel-btn',
            glyph: 0xf057 // fa-times-circle
        },{
            xtype: 'tbfill'
        },{
            text: 'Save',
            itemId: 'tickets-details-save-btn',
            cls: 'glyph-success',
            glyph: 0xf058 // fa-check-circle
        }]
    }],
    
    bodyStyle: {
        borderWidth: 0,
        padding: '15px 10px 10px'
    },
    
    defaultType: 'textfield',
    
    fieldDefaults: {
        xtype: 'textfield',
        labelAlign: 'right',
        labelSeparator: '',
        anchor: '100%',
        allowBlank: true
    },   
    
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        
        me.on('dirtychange', me.onFormDirtyChange,me);
    },
    
    onFormDirtyChange: function(form, isDirty) {
        var me = this,
            ticket = me.getSelectedTicket(),
            dirty = isDirty,
            checkDirty;

        return me.down('toolbar')[dirty ? 'enable' : 'disable'](dirty);
    },
    
    resetForm: function() {
        var me = this;
        
        Ext.each(me.getForm().getFields().items, function(field) {
            if (field.getItemId() == 'assigneeClassCombo') {
                return;
            }
            
            field.setValue(null);
            field.resetOriginalValue();
            field.reset();
        });
    },
    
    //@private method
    //TODO: rename to uploadLoadedAsset
    updateSelectedTicket: function(ticket, oldTicket) {
        var me = this,
            items = me.getForm().getFields().items,
            i = 0, len = items.length, c,
            assignee, assigneeStore;
        
        me.resetForm();
        
        if(!ticket) {
            return;
        }
        
        assignee = ticket.get('Assignee');
        
        //TODO: check if oldAsset is dirty and prompt user to save.
        Ext.suspendLayouts();
        me.suspendEvents();
        
        me.loadRecord(ticket);
        
        // loop through fields to set initial form value, to update form dirtyness        
        for (; i < len; i++) {
            c = items[i];
            if (c && c.mixins && c.mixins.field && typeof c.mixins.field.initValue == 'function') {
                c.mixins.field.initValue.apply(c);
                c.wasDirty = false;
            }
        }
        
        if(assignee) {
            me.down('#assigneeIdCombo').originalValue = assignee.ID;
            me.down('#assigneeIdCombo').setValue(assignee.ID);
           
            
            assigneeStore = me.down('#assigneeIdCombo').store;
            
            if (!assigneeStore.isLoaded() && !assigneeStore.isLoading()) {
                me.down('#assigneeIdCombo').setRawValue(assignee.FirstName + ' ' + assignee.LastName);
                
                assigneeStore.on('load', function() {
                    console.log('setting value on combo after load');
                    me.down('#assigneeIdCombo').setValue(assignee.ID);
                    
                }, me, {single: true});
                
                assigneeStore.load();
            }
        }
        
        me.selectedTicket = ticket;
        
        Ext.resumeLayouts(true);
        me.resumeEvents();
       
    },
    
    items: [{
        fieldLabel: 'Nickname',
        name: 'Name'
    },{
        fieldLabel: 'Description',
        name: 'Description',
        xtype: 'textareafield'
    },{
        xtype: 'container',
        layout: 'hbox',
        margin: '0 0 5',
        
        defaultType: 'combo',
        
        items: [{
            width: 180,
            margin: '0 5 0 0',
            fieldLabel: 'Assignee',
            itemId: 'assigneeClassCombo',
            
            forceSelection: true,
            editable: false,
            value: 'Person',
            
            store: [
                'Person'
            ],
            
            disabled: true
            
        },{
            flex: 1,
            itemId: 'assigneeIdCombo',
            
            name: 'AssigneeID',
            valueField: 'ID',
            queryParam: 'q',
            displayField: 'FullName',
            store: 'people.People',
            
            disabled: false
        }]
    },{
        xtype: 'component',
        cls: 'form-timestamp',
        tpl: 'last changed <a href="javascript::void(0);">{AssigneeModified}/a>'
    },{
        xtype: 'combo',
        itemId: 'statusCombo',
        fieldLabel: 'Status',
        name: 'Status',
        editable: false,
        forceSelection: true,
        
        store: [
            'Open',
            'Closed'
        ]
    },{
        xtype: 'component',
        cls: 'form-timestamp',
        tpl: 'last changed <a href="javascript::void(0);">{StatusModified}/a>'
    }]
});