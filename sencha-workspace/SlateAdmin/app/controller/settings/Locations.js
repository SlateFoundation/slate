/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.Locations', {
    extend: 'Ext.app.Controller',
    
    
    // controller config
    views: [
        'settings.locations.Manager',
        'settings.locations.Menu'
    ],
    
    stores: [
        'settings.LocationsTree'
    ],
    
    routes: {
        'settings/locations': 'showManager'
    },
    
    refs: [{
        ref: 'settingsNavPanel',
        selector: 'settings-navpanel'
    },{
        ref: 'manager',
        selector: 'settings-locations-manager',
        autoCreate: true,
        
        xtype: 'settings-locations-manager'
    },{
        ref: 'menu',
        selector: 'settings-locations-menu',
        autoCreate: true,
        
        xtype: 'settings-locations-menu'
    }],
    
	
	// controller template methods
    init: function() {
        var me = this;
        
       /*
 Ext.getStore('settings.LocationsTree').on('beforesync', function(){
            debugger;
        });
        Ext.getStore('settings.LocationsTree').on('write', function(){
            debugger;
        });
*/
        
        me.control({
            'settings-locations-manager': {
                show: me.onManagerShow
            },
            'settings-locations-manager treeview': {
                beforedrop: me.onBeforeLocationDrop
            },
            'settings-locations-manager button[action=create-location]': {
                click: me.onCreateLocationClick
            }
        });
    },
    
    
    // route handlers
    showManager: function() {
        var me = this,
            navPanel = me.getSettingsNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('settings/locations');
        navPanel.expand(false);
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.loadCard(me.getManager());

        Ext.resumeLayouts(true);
    },
    
    onBeforeLocationDrop: function(node, data, overDropModel) {
        var treeStore = Ext.getStore('settings.LocationsTree'),
            overDragModel;

        Ext.Msg.confirm('Moving Location', ('Are you sure you want to move this location to "' + overDropModel.get('Title') + '"'), function (btnId) {
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
    
    // event handlers
    onManagerShow: function(managerPanel) {
        var rootNode = managerPanel.getRootNode();
        
        if (!rootNode.isLoaded()) {
            managerPanel.setLoading('Loading locations&hellip;');
            
            rootNode.expand(false, function() {
                managerPanel.setLoading(false);
            });
        }

        Ext.util.History.pushState('settings/locations', 'Locations &mdash; Settings');
    },

    onCreateLocationClick: function() {
        var selModel = this.getManager().getSelectionModel(),
            selection = selModel.getSelection()[0],
            headerText = selection ? 'Create sub location' : 'Create Location',
            bodyText = 'Enter a name for the new location',
            treeStore = Ext.getStore('settings.LocationsTree'),
            newLocation;
            
        bodyText += selection ? (' under "' + selection.get('Title') + '"') : '';
        
        Ext.Msg.prompt(headerText, (bodyText+':'), function(btn, text) {
            
            text = Ext.String.trim(text);
            
            if (btn == 'ok' && text) {
                newLocation = Ext.create('SlateAdmin.model.Location', {
                    Title: text,
                    ParentID: selection ? selection.get('ID') : null,
                    namesPath: '/' + text
                });

                newLocation.save({
                    success: function() {
                        if(selection) {
                            selection.set('leaf', false);
                            selection.appendChild(newLocation);
                            selection.expand();
                        } else {
                            treeStore.getRootNode().appendChild(newLocation);
                        }
                    }
                });
            }
        });
    }
});