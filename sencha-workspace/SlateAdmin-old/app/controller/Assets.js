/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.Assets', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox'    
    ],
    // controller config
    views: [
        'assets.NavPanel',
        'assets.Manager',
        'assets.details.Form'
    ],

    stores: [
        'Assets',
        'assets.Locations',
        'assets.Statuses',
        'assets.TreeNodes',
        'assets.TemplateDataFields'
    ],

    routes: {
        'assets': 'showAssets',
        'assets/lookup/:assetId': 'showAsset',
        'assets/search/:query': {
            action: 'showResults',
            conditions: {
                ':query': '[^/]+'
            }
        },
        'assets/search/:query/:assetId': {
            action: 'showResults',
            conditions: {
                ':query': '[^/]+',
                ':assetId': '[^/?]+'
            }
        },
        'assets/create': {
            action: 'createNewAsset'
        }
    },

    refs: [{
        ref: 'navPanel',
        selector: 'assets-navpanel',
        autoCreate: true,

        xtype: 'assets-navpanel'
    },{
        ref: 'navTreePanel',
        selector: 'assets-navpanel #filters',
        
        autoCreate: true
    },{
        ref: 'searchField',
        selector: 'assets-navpanel searchfield'
    },{
        ref: 'manager',
        selector: 'assets-manager',
        autoCreate: true,

        xtype: 'assets-manager'
    },{
        ref: 'grid',
        selector: 'assets-grid'
    },{
        ref: 'activityCt',
        selector: 'assets-activity',
        autoCreate: true,

        xtype: 'assets-activity'
    },{
        ref: 'activityCmp',
        selector: '#activityCmp'
    },{
        ref: 'selectionCountCmp',
        selector: 'assets-grid #selectionCount'
    },{
        ref: 'detailsForm',
        selector: 'assets-details-form',
        
        autoCreate: true,
        
        xtype: 'assets-details-form'
    },{
        ref: 'leaveNoteBtn',
        selector: 'assets-activity #submitNote'
    },{
        ref: 'activityTextArea',
        selector: 'assets-activity textareafield'
    },{
        ref: 'batchLocationBtn',
        selector: 'assets-grid #batchLocation'
    },{
        ref: 'batchStatusBtn',
        selector: 'assets-grid #batchStatus'
    },{
        ref: 'addExtraInfoFieldBtn',
        selector: 'assets-details-form #addFieldBtn'
    }],


    // controller template methods
    init: function() {
        var me = this;

        me.control({
            'assets-navpanel textfield[inputType=search]': {
                specialkey: me.onSearchSpecialKey,
                clear: me.onSearchClear
            },
            'assets-navpanel': {
                expand: me.onNavPanelExpand
            },
            'assets-navpanel #filters': {
                select: me.onTreePanelNodeSelect
            },
            'assets-grid': {
                select: { fn: me.onAssetSelect, buffer: 10 },
                beforeselect: { fn: me.onBeforeAssetSelect},
                deselect: { fn: me.onAssetDeselect, buffer: 10},
                batchstatusupdate: me.onGridBatchAction,
                batchlocationupdate: me.onGridBatchAction
            },
            'assets-activity textareafield': {
                change: me.onActivityCommentChange
            },
            'assets-activity #submitNote': {
                click: me.onSubmitActivityNoteClick
            },
            '#assets-details-save-btn': {
                click: me.onSaveAssetDetailsClick
            },
            '#assets-details-cancel-btn': {
                click: me.onCancelAssetDetailsClick
            },
            'assets-details-form #addFieldBtn': {
                click: me.onAddExtraFieldBtnClick
            },
            'assets-grid #addAsset': {
                click: me.onAddNewAsset
            },
            'assets-ticketsgrid': {
                ticketsaved: me.onAssetsTicketGridChange
            }
        });
        
        me.getAssetsTemplateDataFieldsStore().load();

    },

    buildNavPanel: function() {
        return this.getNavPanel();
    },

    // route handlers
    
    showAssets: function() {
        var me = this,
            treePanel = me.getNavTreePanel(),
            navPanel = me.getNavPanel(),
            searchField = me.getSearchField(),
            rootAssetNode = me.getAssetsTreeNodesStore().getRootNode().getChildAt(0),
            selectedNode = treePanel.getSelectionModel().getSelection()[0],
            _selectRootNode = function() {
                if (selectedNode && selectedNode.isAncestor(rootAssetNode))
                    return;
                    
                treePanel.getSelectionModel().select(rootAssetNode, false, true);
            };

        Ext.suspendLayouts(); 
        me.expandNavOnRender();
        me.getApplication().getController('Viewport').loadCard(me.getManager());
        Ext.resumeLayouts(true);
        
        //reset search field & empty grid store
        searchField.setValue(null);
        me.getGrid().getStore().getProxy().setExtraParam("q", null);
        me.getGrid().store.removeAll();
        
        if (treePanel.rendered) {
            _selectRootNode();
        } else {
            treePanel.on('render', _selectRootNode);
        }
    },
    
    showAsset: function(assetId) {
        var me = this,
            ExtHistory = Ext.util.History,
            manager = me.getManager(),
            id = ExtHistory.decodeRouteComponent(assetId),
            
            _onAssetNotFound = function() {
                ExtHistory.resumeState(false);
                return Ext.Msg.alert('Error', 'The asset you requested could not be found. Please try again', function() {
                   ExtHistory.pushState('assets');
                });
            },
            _onAssetFound = function(rec) {                
                ExtHistory.resumeState(false);                
                ExtHistory.pushState('assets/lookup/'+rec.getId());
            };
        
        ExtHistory.suspendState();
        Ext.suspendLayouts();
        
        // activate manager
        me.expandNavOnRender();
        me.getApplication().getController('Viewport').loadCard(manager);
        
        me.selectAsset(id, function(assetRecord) {
            if (assetRecord) {
                _onAssetFound(assetRecord);
            } else {
                _onAssetNotFound();
            }
        });
        
        Ext.resumeLayouts(true);
        
    },
    
    showResults: function(query, assetId) {
        var me = this,
            ExtHistory = Ext.util.History,
            store = me.getAssetsStore(),
            proxy = store.getProxy(),
            manager = me.getManager();
            
        ExtHistory.suspendState();
        Ext.suspendLayouts();
        
        //decode query string for processing
        query = ExtHistory.decodeRouteComponent(query);
        assetId = ExtHistory.decodeRouteComponent(assetId);

        // queue store to load
        proxy.abortLastRequest(true);
        
        if (query) {            
            proxy.setExtraParam('q', query);
        } else {
            delete proxy.extraParams.q;
        }

        //sync search form & treepanel
        me.getSearchField().setValue(query);
        me.syncNavTreePanel();
        
        // activate manager
        me.expandNavOnRender();
        me.getApplication().getController('Viewport').loadCard(manager);
 
        // resume layouts and insert a small delay to allow layouts to flush before triggering store load so loading mask can size correctly
        Ext.resumeLayouts(true);
        Ext.defer(function() {
            Ext.suspendLayouts();
            
            // execute search (suppressed by doSearch if query hasn't changed) and select asset
            me.doSearch(false, function() {
                me.selectAsset(assetId, function() {
                    ExtHistory.resumeState();
                    Ext.resumeLayouts();
                });
            });
        }, 10);
    },
    
    createNewAsset: function() {
        var me = this,
            asset = Ext.ModelMgr.create({}, 'SlateAdmin.model.Asset');

        me.showAssets();
        
        me.getActivityCt().disable();
        me.getManager().updateSelectedAsset(asset);

        me.getDetailsForm().down('textfield').focus(100);
    },
    
    // event handlers
    
    onNavPanelExpand: function(panel, isExpanding) {
        var me = this,
            token = Ext.History.getToken(),
            ctrl;
        
        if (token == 'assets') {            
            ctrl = me;
        } else if (token == 'tickets') {
            ctrl = me.getApplication().getController('Tickets');
        }
        
        if (ctrl) {
            ctrl.syncState();
        }
    },
    
    expandNavOnRender: function(wait) {
        var me = this,
            nav = me.getNavPanel(),
            mainNav = nav.ownerCt,
            defer = wait || 1500;
        
        if (!mainNav) {
            return;
        } else if (!mainNav.rendered) {
            return mainNav.on('render', function() {
                me.expandNavOnRender(wait);
            }, me, {single: true});
        } else if (!nav.rendered) {
            return nav.on('afterrender', function() {
                me.expandNavOnRender(wait);
            }, me, {single: true});
        }
        
        Ext.defer(function() {
            nav.expand();
        }, defer, me);

    },
    
    onSearchClear: function(field, ev) {
        this.getNavTreePanel().getSelectionModel().select(0, false, true);
        field.reset();
    },
    
    onSearchSpecialKey: function(field, ev) {
        var query = field.getValue().trim();

        if(ev.getKey() == ev.ENTER) {
            if(query) {
                Ext.util.History.add(['assets', 'search', query]);
            }
        }
    },
    
    onStoreLoad: function(store) {
        this.syncGridStatus();  
    },
    
    onBeforeAssetSelect: function(selModel, record, index) {
         var me = this,
            form = me.getDetailsForm();
            
        if (selModel.getCount() == 1 && form.isDirty()) {

            Ext.Msg.confirm('Cancel Edit?', 'Are you sure you want to cancel editing this asset?', function(answer) {
                if (answer == 'yes') {
                    selModel.select(record);
                }
            }, me);
            
            return false;
        }
    },
    
    onAssetSelect: function(selModel, record, index) {
        var me = this,
            selectionCount = selModel.getCount();

        Ext.suspendLayouts();
        me.syncGridStatus();

        if (selectionCount == 1) {
            me.getManager().setSelectedAsset(record);
            me.syncState();
        }
        
        Ext.resumeLayouts(true);

    },
    
    onAssetDeselect: function(selModel, record, index) {
        var me = this,
            firstRecord,
            token;

//        Ext.suspendLayouts();
        me.syncGridStatus();

        if (selModel.getCount() == 1) {
            firstRecord = selModel.getSelection()[0];
            me.onAssetSelect(selModel, firstRecord, firstRecord.index);
        } else {
            me.getManager().setSelectedAsset(null);
            me.syncState();
        }
        
        Ext.resumeLayouts(true);
    },
    
    onTreePanelNodeSelect: function(treePanel, record, index) {
        var me = this,
            acceptableClasses = ['asset', 'status', 'location'];
    
        //cancel if not an asset node.
        if (acceptableClasses.indexOf(record.get('Class').split('\\').pop().toLowerCase()) === -1) {
            return;
        }
        
        //return false if record was dbl clicked and already being handled.
        if (record.isExpandable() && record.isLoading() ) {
            return false;    
        }
        
        //return false if node is a "filter".
        if (record.getQueryParam(false)) {
            return false;
        } 
        
        
        this.syncQueryField(true);
        
    },
    
    onActivityCommentChange: function(textArea, newValue, oldValue) {
        var me = this,
            submitBtn = me.getLeaveNoteBtn();
        
        if (newValue) {
            submitBtn.enable();
        } else {
            submitBtn.disable();
        }
        
    },
    
    onSubmitActivityNoteClick: function() {
        var me = this,
            note = me.getActivityTextArea().getValue(),
            asset = me.getManager().getSelectedAsset(),
            photos;
        
        
        if (note) {            
            me.createActivityNote(note, asset);
        }
        
    },
    
    createActivityNote: function(note, asset) {
        var me = this,
            manager = me.getManager(),
            activityCt = me.getActivityCt(),
            dataview = activityCt.down('dataview'),

            xhr = new XMLHttpRequest(),
            formData = new FormData(),
            
            mediaFiles = dataview.store.data.items,
            keepFiles = [],
            _onActivityCreated; 
            
        _onActivityCreated = function(event) {
            var response = Ext.decode(event.currentTarget.response),
                activity;
            
            if (response.success === false) {                                
                Ext.Msg.alert('Error', 'There was an error updating the activity. Please try again.');
            }
            
            if (response.failed) {
                Ext.iterate(response.failed, function(fileName, error) {
                    keepFiles.push(fileName);
                }, me);
                
                Ext.each(mediaFiles, function(activity) {
                    if(activity && activity.raw && activity.raw.file && keepFiles.indexOf(activity.raw.file.name) === -1) {
                        activity.destroy();
                    }
                });
                
                Ext.each(keepFiles, function(filename) {
                    activity = dataview.store.findRecord('filename', filename);
                    if (activity) {
                        activity.set('error', response.failed[filename]);
                    }
                });
            }
            
            me.updateSelectedAssetActivity();
            
        };
        
        xhr.open('POST','/assets/'+asset.getId()+'/activity/create?format=json');
        xhr.onload = Ext.bind(_onActivityCreated, me);
        
        Ext.each(mediaFiles, function(mediaFile, i) {
            formData.append('mediaUpload['+i+']', mediaFile.raw.file);
        }, me);
        
        formData.append('Note', note);
        
        xhr.send(formData);
        
    },
    
    updateSelectedAssetActivity: function() {
        var me = this,
            manager = me.getManager(),
            asset = manager.getSelectedAsset();
            
        if (!asset || asset.phantom) {
            return;
        }
            
        Ext.Ajax.request({
            url: '/assets/'+asset.getId()+'/activity',
            method: 'GET',
            scope: me,
            params: {
                format: 'json',
                'include[]': [
                    'Actor',
                    'Media',
                    'changes'
                ]
            },
            success: function(response, opts) {
                var responseData = Ext.decode(response.responseText);
                asset.beginEdit();
                asset.set('Stories', responseData.data);
                asset.commit();
                return manager.updateSelectedAsset(asset);
            }
        });
    },
    
    onSaveAssetDetailsClick: function(btn) {
        var me = this,
            form = me.getDetailsForm(),
            extraInfoCts = form.query('[extraInfoCt]'),
            aliasFieldTypes = ['SDPID', 'MacAddress', 'MfrSerial'],
            contextComboFields = ['Assignee', 'Owner'],
            aliases = [],
            asset = form.getRecord(),
            wasPhantom = asset.phantom;
        
        //loadmask
        form.setLoading({
            msg: 'Saving Asset&hellip;'
        });
        
        //update record from form
        form.updateRecord();
        
        //loop through extra info fields that were set previously, delete empty fields.
        Ext.each( form.query('[extraInfoField]'), function(infoField) {
            var fieldName = infoField.extraInfoField,
                inputValue = infoField.getValue(),
                assetData = asset.get('Data'),
                fieldValue = assetData[fieldName],
                newAssetData = {};
    
            if ( inputValue && (fieldValue != inputValue.trim())) {
                if (asset.modified.Data === undefined) {                
                    asset.modified.Data = assetData;
                }
                
                newAssetData[fieldName] = inputValue.trim();
                asset.set('Data', Ext.merge(assetData, newAssetData));
            } else if (!inputValue) {
                delete assetData[fieldName];
                asset.set('Data', assetData);
            }
        }, me);
//        debugger;
        Ext.each(extraInfoCts, function(extraInfoCt) {
            var keyField = extraInfoCt.down('combo'),
                valueField,
                
                keyFieldValue, valueFieldValue,
                
                assetData = asset.get('Data') || {};
                
            if (!keyField) {
                return;
            }
            
            keyFieldValue = keyField.getValue();
            valueField = keyField.next('combo');
            
            if (!valueField || !keyFieldValue) {
                return;
            }
            
            valueFieldValue = valueField.getValue();
            
            if(!valueFieldValue) {
                return;
            }
            //manually set field modified to persist to server.
            if (asset.modified.Data === undefined) {                
                asset.modified.Data = assetData;
            }
            
            assetData[keyFieldValue.trim()] = valueFieldValue.trim();
            asset.set('Data', assetData);
            
        }, me);
        
        //loop through alias 
        Ext.each(aliasFieldTypes, function(aliasFieldType) {
            var aliasField = form.down('#'+aliasFieldType.toLowerCase());
            
            if (aliasField.getValue().trim()) {
                aliases.push({
                    Type: aliasFieldType,
                    Identifier: aliasField.getValue()
                });   
            }
        }, me);
        
        asset.set('Aliases', aliases);
        
        //loop through context-combos
        Ext.each(contextComboFields, function(contextComboField) {
            var contextCombo = form.down('#' + contextComboField.toLowerCase() + 'ClassCombo'),
                contextIdCombo = form.down('#' + contextComboField.toLowerCase() + 'IdCombo'),
                cls, id, values = {},
                clsField, idField;
                
            if (contextCombo && contextIdCombo) {
                cls = contextCombo.getValue();
                id = contextIdCombo.getValue();
                
                clsField = contextComboField + 'Class';
                idField = contextComboField + 'ID';
                
                if (cls && id) {
                    values[clsField] = cls;
                    values[idField] = id;
                    
                    asset.modified[clsField] = asset.get(clsField);
                    asset.modified[idField] = asset.get(idField);

                    asset.set(values);
                }
            }
        }, me);
        
        asset.save({
            callback: function(record, op, succ) {
                var token = Ext.History.getToken(),
                    url = [];
                    
                if (succ) {
                    
                    me.getManager().updateSelectedAsset(record);
                    me.getGrid().getSelectionModel().deselectAll(true);
                    if(wasPhantom) {
                        form.setLoading(false);
                        url.push('assets','lookup', record.get('ID'));
                        Ext.History.add(url.join('/'), false);
                    } else {
                        form.setLoading(false);
                        me.getGrid().getStore().reload({
                            callback: function(records) {
                                if (me.getGrid().getSelectionModel().getSelection().indexOf(record) === -1) {
                                    me.selectAsset(record);
                                    me.updateSelectedAssetActivity();
                                }
                            },
                            scope: me
                        });
                    }
                }
            },
            scope: me
        });
    },
    
    onCancelAssetDetailsClick: function(btn) {
        var me = this,
            form = me.getDetailsForm(),
            asset = form.getSelectedAsset();
            
        form.updateSelectedAsset(asset);
    },
    
    onGridBatchAction: function(grid, menu, item) {
        var me = this,
            form = me.getDetailsForm(),
            btn = menu.up('button'),
            assets = grid.getSelectionModel().getSelection(),
            field, value,
            data = [], dataObj = {},
            i = 0;
        
        //cancel if asset details form is dirty
        if (form.isDirty()) {
            Ext.Msg.alert('Save Changes', 'Please save or cancel changes to the selected Asset before batch updating Assets');
            return;
        }
        
        switch (btn.getItemId()) {
            case 'batchStatus': 
                field = 'StatusID';
                break;
                
            case 'batchLocation':
                field = 'LocationID';
                break;
        }
        
        value = item.record.getId();
        
        for(; i < assets.length; i++) {
            dataObj = {
                ID : assets[i].getId()
            };
            dataObj[field] = value;
            data.push(dataObj);
            
            assets[i].beginEdit();

            assets[i].set(dataObj);
            assets[i].endEdit();
        }  
        
        Ext.Ajax.request({
            url: '/assets/save',
            params: {
                format: 'json'
            },
            jsonData: {
                data : data
            },
            success: function(response, opts) {
                var token = Ext.History.getToken(),
                    splitToken = token.split('/');
                    
                grid.getSelectionModel().deselectAll(true);
                me.syncGridStatus();
                
                if(splitToken.length && Ext.isNumeric(splitToken[splitToken.length-1])) {
                    splitToken.pop();
                    Ext.History.add(splitToken, true);
                }

                me.doSearch(true, function() {
                });
                
            },
            failure: function(response, opts) {
                Ext.Msg.alert('Error', 'There was an error updating the selected assets, please try again.');
            }
        })
        
    },
    
    onAddExtraFieldBtnClick: function() {
        var me = this,
            form = me.getDetailsForm(),
            extraInfoFieldset = form.down('#extraInfoFields'),
            extraInfoFieldIds = form.extraInfoFieldIds || [],
            fieldItemId = 'phantomDataField'+ extraInfoFieldIds.length || 1,
            valueItemId = 'phantomDataValue'+ extraInfoFieldIds.length || 1,
            config = {
                xtype: 'container',
                extraInfoCt: true,
                layout: 'hbox',
                margin: '0 0 5',
                items: [{
                    width: 100,
                    xtype: 'combo',
                    itemId: fieldItemId,
                    margin: '0 5 0 0',
                    
                    queryParam: 'q',
                    displayField: 'name',
                    store: {
                        model: 'SlateAdmin.model.asset.TemplateDataField',
                        filters: [
                            function(item) {
                                return (extraInfoFieldset.down('#data-'+item.get('name')+'-combo') ) ? false : true;
                            }    
                        ]
                    },
                    listeners: {
                        change: function(combo, value, oldValue) {
                            var templateFieldsStore = Ext.getStore('assets.TemplateDataFields');
                            
                            if(!value) {
                                combo.next('combo').disable();
                                return;
                            }
                            //update dependent combo url & enable
                            if (!templateFieldsStore.findRecord('name', value) && templateFieldsStore.findRecord('name', oldValue)) {
                                combo.next('combo').bindStore(false);
                                combo.next('combo').queryMode = 'local';
                            }
                            
                            combo.next('combo').enable();
                        },
                        select: function(combo, record) {
                            //focus on next combo 
                            var nextCombo = combo.next('combo');
                            
                            nextCombo.bindStore({
                                fields: ['name'],
                                
                                proxy: {
                                    type: 'slaterecords',
                                    extraParams: {
                                        format: 'json'
                                    },
                                    url: '/assets/*extra-info-fields/'+combo.getValue()
                                },
                                autoLoad: true
                            });
                            nextCombo.queryMode = 'remote';
                            nextCombo.focus(true, 100);
                        }
                    }
                },{
                    flex: 1,
                    xtype: 'combo',
                    itemId: valueItemId,
                    lazyAutoLoad: false,
                    
                    queryMode: 'remote',
                    displayField: 'name',
                    queryParam: 'q',
                    
                    disabled: true,
                    
                    listeners: {
                        beforequery: function(queryPlan) {
                            if (!queryPlan.combo.store) {
                                return false;
                            }
                        }
                    }
                }]
            };
        
            extraInfoFieldIds.push(fieldItemId);
            
            extraInfoFieldset.add(extraInfoFieldset.items.length - 1, config);
            
            form.extraInfoFieldIds = extraInfoFieldIds;         
    },
    
    onAddNewAsset: function(btn) {
        var me = this,
            asset = Ext.ModelMgr.create({}, 'SlateAdmin.model.Asset');
        
        if(me.getDetailsForm().isDirty()) {
            Ext.Msg.confirm('Cancel Edit?', 'Are you sure you want to cancel editing this asset?', function(answer) {
                if (answer == 'yes') {
                    Ext.History.pushState(['assets', 'create'], 'Create Asset');
                }
            }, me);
            return;
        }
        
        Ext.History.pushState(['assets', 'create'], 'Create Asset');
    },
    
    doSearch: function(forceReload, callback) {
        var me = this,
            store = Ext.getStore('Assets'),
            proxy = store.getProxy();

        if (forceReload || proxy.isExtraParamsDirty()) {
            me.getManager().updateSelectedAsset(null);
            me.syncGridStatus();
            store.removeAll();
            
            store.load({
                callback: callback,
                scope: me
            });
        } else {
            Ext.callback(callback, me);
        }
    },
    
    syncGridStatus: function() {
        var me = this,
            grid = me.getGrid(),
            selectionCountCmp = me.getSelectionCountCmp(),
            setLocationBtn = me.getBatchLocationBtn(),
            setStatusBtn = me.getBatchStatusBtn(),
            selectionCount = grid.getSelectionModel().getCount(),
            actionCount = selectionCount || grid.getStore().getTotalCount(),
            hideBulkEditBtns = selectionCount >= 2;

        Ext.suspendLayouts();

        // update footer labels/buttons
        if (selectionCount >= 1) {
            //make sure row is visible
            if (selectionCount === 1) {
                Ext.defer(function() {                
                    grid.view.scrollRowIntoView(grid.getSelectionModel().getSelection()[0], false, true);
                    console.log('showing row');
                }, 500, me);
                
            }
            selectionCountCmp.setText(selectionCount + (selectionCount==1?' asset':' assets') + ' selected:');
            selectionCountCmp.show();
            
            setStatusBtn.enable();
            setLocationBtn.enable();
            
        } else {
            selectionCountCmp.hide();
        }

        // disable any components marked bulkOnly unless multiple rows are selected
        Ext.each(grid.query('toolbar [bulkOnly]'), function(editBtn) {
            editBtn.setDisabled(!hideBulkEditBtns);
        });

        Ext.resumeLayouts(true);
    },
    
    syncState: function() {
        var me = this,
            manager = me.getManager(),
            assetRecord = manager.getSelectedAsset(),
            extraParams = me.getAssetsStore().getProxy().extraParams,
            path = ['assets'],
            title = 'Assets';
        
        
        if (extraParams && extraParams.q) {
            path.push('search', extraParams.q);
            title = '&ldquo;' + extraParams.q + '&rdquo;';
            if (assetRecord)
                path.push(assetRecord.getId().toString());
        } else if (assetRecord) {
            path.push('lookup');
            
            if (assetRecord.get('Name')) {
                title = assetRecord.get('Name');
            }
            
            path.push(assetRecord.get('ID').toString());
        }
        
        Ext.util.History.pushState(path, title);
    },
    
    /**
    * Selects an asset (or clears selection) and updates grid+manager state without firing any select/deselect events
    */
    selectAsset: function(asset, callback) {
        var me = this,
            manager = me.getManager(),
            grid = me.getGrid(),
            form = me.getDetailsForm(),
            store = grid.getStore(),
            selModel = grid.getSelectionModel(),
            assetRecord, queryParts, fieldName, fieldValue,
            _finishSelectAsset;
            
        _finishSelectAsset = function() {
            
            manager.setSelectedAsset(assetRecord || null);    
            
            if (assetRecord) {
                selModel.select(assetRecord, false, true);
            } else {
                selModel.deselectAll(true);
            }
            
            me.syncGridStatus();
            me.syncState();
            Ext.callback(callback, me, [assetRecord]);
        };

        if (!asset) {
           _finishSelectAsset();
        } else if (Ext.isString(asset) && asset.charAt(0) != '?') {
            assetRecord = store.findRecord('ID', asset);
            
            if (assetRecord) {
                _finishSelectAsset();
            } else {
                store.load({
                    url: '/assets/'+asset,
                    scope: me,
                    callback: function(records, operation, success) {
                        if (!success || !records.length) {
                            Ext.Msg.alert('Error', 'Could not find the asset you requested');
                        } else {
                            assetRecord = records[0];
                        }

                        _finishSelectAsset();
                    }
                });
            }
        } else {
            assetRecord = asset;
            _finishSelectAsset();
        }
    },
    
    /**
     * Updates the query string field from the search form and treepanel
    */
    syncQueryField: function(execute) {
        var me = this,
            searchField = me.getSearchField(),

            selectedNodes = me.getNavTreePanel().getSelectionModel().getSelection(),

            selectedNode, rootHash, queryParam, url,
        
            rootAssetNode = me.getAssetsTreeNodesStore().getRootNode().getChildAt(0),
            
            fieldName, fieldValue,
            
            query = searchField.getValue(),
            terms = query.split(/\s+/),
            termsLen = terms.length, termIndex = 0, term, splitTerm,

            unmatchedTerms = [],
            queuedTerms = [];
        
        if (selectedNodes.length > 0) {
            
            selectedNode = selectedNodes[0];
            
            url = selectedNode.getUrl();
            rootHash = url.split('/').splice(1).shift();
            queryParam = selectedNode.getQueryParam();
            fieldValue = selectedNode.getQueryValue();
            
            if (fieldValue && queryParam) {
                query = queryParam+':'+fieldValue;
            } else {
                query = null;
            }
            
        }


        searchField.setValue(query);
        Ext.defer(function() {
            me.syncNavTreePanel();
        }, 500, me);
        
        if (execute) {
            Ext.util.History.add(query ? [rootHash, 'search', query] : rootHash);
        }
    },
    
    /**
     * Searches the nav tree panel from the query string field and selects the node.
     */
    syncNavTreePanel: function() {
        var me = this,
            navTreePanel = me.getNavTreePanel(),
            rootNode = navTreePanel.getRootNode().getChildAt(0),
            query = me.getSearchField().getValue(),
            terms = query.split(/\s+/),
            termsLen = terms.length, termIndex = 0, term,
            values = {},
            ancestorNode, node,
            queryParam,
            _afterNodeExpand;
        
        _afterNodeExpand = function() {        
            Ext.resumeLayouts();
            
            if (node) {
                navTreePanel.getSelectionModel().select(node, false, true);
            }
            
            navTreePanel.resumeEvents();
        };

        // build map of keyed search terms
        for (; termIndex < termsLen; termIndex++) {
            term = terms[termIndex].split(/:/, 2);
            if (term.length == 2) {
                values[term[0]] = term[1];
            }
        }
        
        if (!navTreePanel.rendered) {
            navTreePanel.on('render', function() {
                return me.syncNavTreePanel();
            }, me, {single: true});
            return;
        }
        
//        Ext.suspendLayouts();

        // sync treepanel selection
        if (values['assets-status']) {
            queryParam = 'assets-status';
            ancestorNode = rootNode.findChild('queryParam', queryParam, true);
        } else if (values.location) {
            queryParam = 'location';
            ancestorNode = rootNode.findChild('queryParam', queryParam, true);
        }

        if (ancestorNode) {
            
            if (!ancestorNode.isLoaded()) {
                Ext.resumeLayouts();
                return ancestorNode.expand(false, function() {
                    return me.syncNavTreePanel();
                });
            }
            
            node = ancestorNode.findChild('Handle', values[queryParam], true);
                
            if (node) {
                navTreePanel.suspendEvents();
                navTreePanel.expandPath(node.parentNode.getPath(), null, null, _afterNodeExpand, me);
            } else {
                navTreePanel.getSelectionModel().select(ancestorNode, false, true);
            }
                        

        } else {
            Ext.resumeLayouts();
        }
    },
    
    onAssetsTicketGridChange: function() {
        var me = this;
//        debugger;
        me.updateSelectedAssetActivity();
    }
    
});