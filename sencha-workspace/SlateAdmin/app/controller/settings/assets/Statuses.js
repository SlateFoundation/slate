/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.assets.Statuses', {
    extend: 'Ext.app.Controller',
    
    
    // controller config
    views: [
        'settings.assets.statuses.Manager',
        'settings.assets.statuses.Menu'
    ],
    
    stores: [
        'settings.assets.StatusesTree'
    ],
    
    routes: {
        'settings/asset-statuses': 'showManager'
    },
    
    refs: [{
        ref: 'settingsNavPanel',
        selector: 'settings-navpanel'
    },{
        ref: 'manager',
        selector: 'settings-assets-statuses-manager',
        autoCreate: true,
        
        xtype: 'settings-assets-statuses-manager'
    },{
        ref: 'menu',
        selector: 'settings-assets-statuses-menu',
        autoCreate: true,
        
        xtype: 'settings-assets-statuses-menu'
    }],
    
	
	// controller template methods
    init: function() {
        var me = this;

        me.control({
            'settings-assets-statuses-manager': {
                show: me.onManagerShow
            },
            'settings-assets-statuses-manager treeview': {
                beforedrop: me.onBeforeAssetStatusDrop
            },
            'settings-assets-statuses-manager button[action=create-status]': {
                click: me.onCreateStatusClick
            }
        });
    },
    
    
    // route handlers
    showManager: function() {
        var me = this,
            navPanel = me.getSettingsNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('settings/asset-statuses');
        navPanel.expand(false);
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.loadCard(me.getManager());

        Ext.resumeLayouts(true);
    },
    
    
    // event handlers
    onManagerShow: function(managerPanel) {
        var rootNode = managerPanel.getRootNode();
        
        if (!rootNode.isLoaded()) {
            managerPanel.setLoading('Loading Statuses&hellip;');
            
            rootNode.expand(false, function() {
                managerPanel.setLoading(false);
            });
        }

        Ext.util.History.pushState('settings/asset-statuses', 'Asset Statuses &mdash; Settings');
    },
    
    onBeforeAssetStatusDrop: function(node, data, overDropModel) {
        var treeStore = Ext.getStore('settings.assets.StatusesTree'),
            overDragModel;
        
        Ext.Msg.confirm('Moving Asset Status', ('Are you sure you want to move this status to "' + overDropModel.get('Title') + '"'), function (btnId) {
            if (btnId == 'yes') {
                
                if (data.records[0].get('ParentID')) {
                    overDragModel = treeStore.getNodeById(data.records[0].get('ParentID'));
                } else {
                    overDragModel = this.getManager().getRootNode();
                }
                
                data.records[0].beginEdit();
                data.records[0].set('ParentID', overDropModel.get('ID'));

                data.records[0].save({
                    callback: function() {
                        treeStore.read({
                            node: overDragModel,
                            callback: function(records) {
                                if (!records.length) {
                                    overDragModel.set('leaf', true);
                                }
                                
                                overDropModel.set('leaf', false);
                                
                                if (!overDropModel.isExpanded()) {
                                    overDropModel.expand();
                                    return false;
                                }
                                
                                overDropModel.appendChild(data.records[0]);
                            }
                        });
                    }
                });
            }    
        }, this);
        
        //returning false to prevent unnecesary re-ordering
        return false;
    },

    onCreateStatusClick: function() {
        var selModel = this.getManager().getSelectionModel(),
            selection = selModel.getSelection()[0],
            headerText = selection ? 'Create sub status' : 'Create Status',
            bodyText = 'Enter a name for the new status',
            treeStore = Ext.getStore('settings.assets.StatusesTree'),
            newStatus;
            
        bodyText += selection ? (' under "' + selection.get('Title') + '"') : '';
        
        Ext.Msg.prompt(headerText, (bodyText+':'), function(btn, text) {
            
            text = Ext.String.trim(text);
            
            if (btn == 'ok' && text) {
                newStatus = Ext.create('SlateAdmin.model.asset.Status', {
                    Title: text,
                    ParentID: selection ? selection.get('ID') : null,
                    namesPath: '/' + text
                });

                newStatus.save({
                    success: function() {
                        if(selection) {
                            selection.set('leaf', false);
                            selection.appendChild(newStatus);
                            selection.expand();
                        } else {
                            treeStore.getRootNode().appendChild(newStatus);
                        }
                    }
                });
            }
        });
    }
});