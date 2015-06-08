Ext.define('SlateAdmin.view.assets.details.Form', {
    extend: 'Ext.form.Panel',

    xtype: 'assets-details-form',
    
    itemId: 'details-form',
    title: 'Asset Details',
    
    config: {
        selectedAsset: null,
        peopleStore: null,
        groupsStore: null
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
            itemId: 'assets-details-cancel-btn',
            glyph: 0xf057 // fa-times-circle
        },{
            xtype: 'tbfill'
        },{
            text: 'Save',
            itemId: 'assets-details-save-btn',
            cls: 'glyph-success',
            glyph: 0xf058 // fa-check-circle
        }]
    }],
    
    bodyPadding: '15 10 10',
    bodyStyle: {
        border: 0
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
        var me = this,
            oCC, oIC, aCC, aIC;
        
        me.callParent(arguments);
        
        oCC = me.down('#ownerClassCombo');
        oIC = me.down('#ownerIDCombo');
        
        aCC = me.down('#assigneeClassCombo');
        aIC = me.down('#assigneeIDCombo');
        
        aCC.on({
            change: 'onAssigneeClassChanged',
            scope: me
        });
        
        oCC.on({
            change: 'onOwnerClassChanged',
            scope: me
        });
        
        me.on({
            dirtychange: 'onFormDirtyChange',
            scope: me
        });
        
    },
    
    _getAliasTypes: function() {
        return ['MacAddress', 'MfrSerial', 'SDPID'];  
    },
    
    _getContextComboFields: function() {
        return ['Assignee', 'Owner'];  
    },
    
    onFormDirtyChange: function(form, isDirty) {
        var me = this,
            asset = me.getSelectedAsset(),
            dirty = isDirty,
            checkDirty;

        return me.down('toolbar')[dirty ? 'enable' : 'disable'](dirty);
    },
    
    resetForm: function() {
        var me = this,
            contextComboFields = me._getContextComboFields();
        
        //clear out & create extra info fields.
        me.removeExtraInfoCts();
        
        Ext.each(me.getForm().getFields().items, function(field) {
            if (field.isXType('combo')) {
                if (field.store) {
                    field.setValue(null);
                    field.resetOriginalValue();
                }
                field.reset();
//                console.log('resetting field: '+field.getItemId(), field);
//                field.initValue();
               return; 
            } else {
                field.setValue(null);
                field.resetOriginalValue();
                field.reset();
            }
            
        });
        
        Ext.each(contextComboFields, function(contextComboField) {
            var contextCombo = me.down('#' + contextComboField.toLowerCase() + 'ClassCombo'),
                contextIdCombo = me.down('#' + contextComboField.toLowerCase() + 'IdCombo');
                
            if(contextCombo && contextIdCombo) {
                contextIdCombo.disable();
            }
        }, me);

    },
    
    //@private method
    //TODO: rename to uploadLoadedAsset
    updateSelectedAsset: function(asset, oldAsset) {
        var me = this,
            extraInfoFieldset = me.down('#extraInfoFields'),
            items = me.getForm().getFields().items,
            i = 0, len = items.length, c,
            validTypes = me._getAliasTypes(),
            assigneeCombo, assigneeIdCombo,
            ownerCombo, ownerIdCombo;
        
        me.resetForm();
        
        if(!asset) {
            return;
        }
        
        //TODO: check if oldAsset is dirty and prompt user to save.
        Ext.suspendLayouts();
        me.suspendEvents();
        
        me.loadRecord(asset);
        
        //load alias relationships in form.
        Ext.each(asset.get('Aliases'), function(alias, i, aliases) {
            var fieldId;
            
            if (validTypes.indexOf(alias.Type) !== -1) {
                fieldId = alias.Type.toLowerCase();
                
                me.down('#'+fieldId).setValue(alias.Identifier);
                me.down('#'+fieldId).originalValue = alias.Identifier;
            }
            
        }, me);
        
        
        //TODO: refine using me._getContextComboFields
        //set assignee class/id combos
        assigneeCombo = me.down('#assigneeClassCombo');
        assigneeIdCombo = me.down('#assigneeIdCombo');
        
        assigneeCombo.setValue(me.getRootModelFromValue(asset.get('AssigneeClass')));
        assigneeCombo.originalValue = me.getRootModelFromValue(asset.get('AssigneeClass'));
        
        assigneeIdCombo.setValue(asset.get('AssigneeID'));
        assigneeIdCombo.originalValue = asset.get('AssigneeID');
        
        ownerCombo = me.down('#ownerClassCombo');
        ownerIdCombo = me.down('#ownerIdCombo');
        
        //set owner class/id combos
        ownerCombo.setValue(me.getRootModelFromValue(asset.get('OwnerClass')));
        ownerCombo.originalValue = me.getRootModelFromValue(asset.get('OwnerClass'));
        
        ownerIdCombo.setValue(asset.get('OwnerID'));
        ownerIdCombo.originalValue = asset.get('OwnerID');
        
        
        // loop through fields to set initial form value, to update form dirtyness        
        for (; i < len; i++) {
            c = items[i];
            if (c && c.mixins && c.mixins.field && typeof c.mixins.field.initValue == 'function' && c.value && !c.isDestroyed) {
                c.mixins.field.initValue.apply(c);
                c.wasDirty = false;
            }
        }
        
        //generate extra info fields and insert them above add btn
        me.createExtraInfoFields(asset);
        
        me.selectedAsset = asset;
        
        me.updateTimestamps();
        
        Ext.resumeLayouts(true);
        me.resumeEvents();
       
    },
    
    updateTimestamps: function() {
        var me = this,
            asset = me.getSelectedAsset();
            
        //location
        me.down('#locationTimestamp').update(asset.getData());
        //assignee
        me.down('#assigneeTimestamp').update(asset.getData());
        //status
        me.down('#statusTimestamp').update(asset.getData());
    },
    
    createExtraInfoFields: function(asset) {
        var me = this,
            asset = asset || me.getSelectedAsset(),
            fields = [],
            extraInfoFieldset = me.down('#extraInfoFields'),
            extraInfoItemIds = [];
        
        if(!asset) {
            return;
        }
        
        Ext.Object.each(asset.get('Data'), function(key, value, object) {
            var url = '/assets/*extra-info-fields/' + key + '?format=json',
                itemId = 'data-'+key+'-combo';
            
            extraInfoItemIds.push(itemId);

            fields.push({
                fieldLabel: key,
                itemId: itemId,
                extraInfoField: key,
                
                value: value,
                originalValue: value,
                store: {
                    model: 'SlateAdmin.model.asset.TemplateDataField',
                    
                    proxy: {
                        type: 'slaterecords',
                        url: url
                    }
                    
                }
            });
            
        }, me);
        
        extraInfoFieldset.insert(0, fields);
        me.extraInfoFieldItemIds = extraInfoItemIds;
        
    },
    
    removeExtraInfoCts: function() {
        var me = this,
            extraInfoFieldset = me.down('#extraInfoFields'),
            cts = extraInfoFieldset.query('container[extraInfoCt]'),
            cfs = extraInfoFieldset.query('combo');
        
        Ext.each( cts, function(ct) {
            ct.destroy();
        }, me);
        
        Ext.each( cfs, function(cf) {
            cf.destroy();
        }, me);
    
        me.extraInfoItemIds = [];
    },
    
    updateDependentIdCombo: function(combo, idCombo, store, displayField, focus) {
        var me = this;   
            
        idCombo.bindStore(store);
        
        store.on('load', function() {
            idCombo.enable();
            if (focus) {
                idCombo.focus(true, 100);    
            }
        }, me);
        
        idCombo.displayField = displayField;
        idCombo.displayTpl = new Ext.XTemplate('<tpl for=".">{'+displayField+'}</tpl>');
        idCombo.getPicker().tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="x-boundlist-item">{'+displayField+'}</div>',
            '</tpl>'
        );
        
        if (!store.isLoading() && !store.isLoaded()) {
            store.load();   
        } else {
            idCombo.enable();
        }
        
        
//        window.idCombo = idCombo;
    },
    
    onOwnerClassChanged: function(combo, newValue, oldValue) {
        var me = this,
            idCombo = me.down('#ownerIdCombo');
        
        return me.handleClassComboChange(combo, idCombo, newValue, oldValue);
    },

    onAssigneeClassChanged: function(combo, newValue, oldValue) {
        var me = this,
            idCombo = me.down("#assigneeIdCombo");

        return me.handleClassComboChange(combo, idCombo, newValue, oldValue);
    },
    
    handleClassComboChange: function(combo, idCombo, newValue, oldValue) {
        var me = this,
            model, displayField,
            endpoint;
        
        if (!newValue) {    
            return idCombo.disable();
        }
        
        if (oldValue) {
            idCombo.setValue(null);
        }
        
        displayField = me.getDisplayFieldFromValue(newValue);
        store = me._getStore(newValue);
        
        if (store) {                
            return me.updateDependentIdCombo(combo, idCombo, store, displayField, oldValue ? true : false);
        } else {
//            debugger;
            return idCombo.disable();
        }
    }, 
    
    _getStore: function(cls) {
        var me = this,
            model = me.getModelFromValue(cls),
            endpoint = me.getEndpointFromValue(cls),
            store; 
        
        
        switch(cls) {
            case 'Group':
            case 'Organization':
                store = 'Groups';
                break;
            
            case 'Person':
            case 'User':
                store = 'People';
                break;
        }
    
        if (store) {
            if (!me['get'+store+'Store']()) {
                me['set'+store+'Store'](
                    Ext.create('Ext.data.Store', {
                        proxy: {
                            type: 'slaterecords',
                            url: endpoint,
                            extraParams: {
                                format: 'json'
                            }
                        },
                        model: model
                    })
                );
            }
            
            return me['get'+store+'Store']();
        } else {
//            debugger;
            return null;
        }
    },
    
    getEndpointFromValue: function(value) {
        var me = this,
            endpoint;
        
        switch (value) {
            case 'Person':
            case 'User':
                endpoint = '/people';
                break;
                
            case 'Organization':
            case 'Group':
                endpoint = '/groups';
        }
        
        return endpoint;
    },
    
    getModelFromValue: function(value) {
        var model;
        
        switch (value) {
            case 'Group':
            case 'Organization':
                model = 'SlateAdmin.model.person.Group';
                break;
            
            case 'Person':
            case 'User':
                model = 'SlateAdmin.model.person.Person';
                break;
        }
        
        return model;
        
    },
    
    getDisplayFieldFromValue: function(value) {
        var displayField;
        
        switch (value) {
            case 'Group':
            case 'Organization':
                displayField = 'Name';
                break;
            
            case 'Person':
            case 'User':
                displayField = 'FullName';
                break;
        }
        
        return displayField;
    },
    
    getRootModelFromValue: function(value) {
        var model;
        
        switch (value) {
            
            case 'User':
            case 'Person':
            case 'Student':    
                
            case 'Emergence\\People\\Person':
            case 'Emergence\\People\\User':
            case 'Slate\\Student':
                
                model = 'Person';
                break;
                
            case 'Group':
            case 'Organization':
                model = 'Group';
                break;
        }
        
        return model;
        
    },

    items: [{
        fieldLabel: 'Nickname',
        name: 'Name'
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
            
            store: [
                'Person',
                'Group'
            ]
            
        },{
            flex: 1,
            itemId: 'assigneeIdCombo',
            
            valueField: 'ID',
            queryParam: 'q',
            displayField: 'FullName',
            
            disabled: true
        }]
    },{
        xtype: 'component',        
        cls: 'form-timestamp',
        tpl: '<tpl if="AssigneeModifiedTime"><small>last changed {AssigneeModifiedTime:fuzzyTime} ago.</small></tpl>',
        itemId: 'assigneeTimestamp'
    },{
        xtype: 'combo',
        itemId: 'statusCombo',
        fieldLabel: 'Status',
        name: 'StatusID',
        store: 'assets.Statuses',
        displayField: 'Title',
        valueField: 'ID',
        queryParam: 'q'
    },{
        xtype: 'component',
        cls: 'form-timestamp',
        tpl: '<tpl if="StatusModifiedTime"><small>last changed {StatusModifiedTime:fuzzyTime} ago.</small></tpl>',
        itemId: 'statusTimestamp'
    },{
        xtype: 'combo',
        itemId: 'locationCombo',
        fieldLabel: 'Location',
        name: 'LocationID',
        store: 'assets.Locations',
        displayField: 'Title',
        valueField: 'ID',
        queryParam: 'q'
    },{
        xtype: 'component',
        cls: 'form-timestamp',
        tpl: '<tpl if="LocationModifiedTime"><small>last changed {LocationModifiedTime:fuzzyTime} ago.</small></tpl>',
        itemId: 'locationTimestamp'
    },{
        xtype: 'fieldset',
        collapsible: true,
        collapsed: true,
        title: 'Permanent IDs',
        margin: '15 -10 0',
        padding: '10',
        style: {
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomWidth: 0
        },
        defaultType: 'textfield',
        items: [{
            xtype: 'container',
            layout: 'hbox',
            margin: '0 0 5',
            items: [{
                width: 180,
                xtype: 'combo',
                itemId: 'ownerClassCombo',
                
                fieldLabel: 'Owner',

                editable: false,
                forceSelection: true,
                
                store: [
                    'Group',
                    'Person'
                ]

            },{
                flex: 1,
                xtype: 'combo',
                itemId: 'ownerIdCombo',
                
                disabled: true,
                queryParam: 'q',
                valueField: 'ID'
            }]
        },{
            fieldLabel: 'Mfr. Serial',
            itemId: 'mfrserial'
        },{
            fieldLabel: 'MAC Address',
            itemId: 'macaddress'
        },{
            fieldLabel: 'SDP ID',
            itemId: 'sdpid'
        }]
    },{
        xtype: 'fieldset',
        itemId: 'extraInfoFields',
        collapsible: true,
        collapsed: true,
        title: 'Extra Info',
        margin: '0 -10',
        padding: '10',
        style: {
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomWidth: 0
        },
        defaultType: 'combo',
        defaults: {
            displayField: 'name',
            valueField: 'name',
            queryParam: 'q'
        },
        items: [{
            xtype: 'button',
            itemId: 'addFieldBtn',
            text: 'Add Another&hellip;',
            glyph: 0xf055, // fa-plus-circle
            cls: 'glyph-success',
            margin: '0 0 0 105'
        }]
    }]
});