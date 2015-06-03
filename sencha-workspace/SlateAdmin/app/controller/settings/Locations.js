/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.Locations', {
    extend: 'Ext.app.Controller',
    
    
    // controller config
    views: [
        'locations.Manager',
        'locations.Menu'
    ],
    
    stores: [
        'Locations',
        'LocationsTree'
    ],
    
    models: [
        'Location'
    ],
    
    routes: {
        'settings/locations': 'showManager'
    },
    
    refs: [{
        ref: 'settingsNavPanel',
        selector: 'settings-navpanel'
    },{
        ref: 'manager',
        selector: 'locations-manager',
        autoCreate: true,
        
        xtype: 'locations-manager'
    },{
        ref: 'menu',
        selector: 'locations-menu',
        autoCreate: true,
        
        xtype: 'locations-menu'
    }],
    
    
	// controller template methods
    init: function() {
        var me = this;

        me.control({
            'locations-manager': {
                show: me.onManagerShow,
                itemcontextmenu: me.onLocationContextMenu
            },
            'locations-manager button[action=create-location]': {
                click: me.onCreateLocationClick
            },
            'locations-menu menuitem[action=browse-locations]': {
                click: me.onBrowseLocationsClick
            },
            'locations-menu menuitem[action=create-location]': {
                click: me.onCreateSublocationClick
            },
            'locations-menu menuitem[action=delete-location]': {
                click: me.onDeleteLocationClick
            }
        });
    },
    
    expandNavOnRender: function(wait, callback, scope) {
        var me = this,
            nav = me.getSettingsNavPanel(),
            mainNav = nav.ownerCt,
            defer = wait || 500;
        
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
            if (callback) {
                nav.on('expand', function() {
                    Ext.callback(callback, scope);
                }, me, {single: true});
            }
            
            nav.expand();
        }, defer, me);

    },
    
    
    // route handlers
    showManager: function() {
        var me = this,
            navPanel = me.getSettingsNavPanel();

        Ext.suspendLayouts();
        Ext.util.History.suspendState();            
    
        navPanel.expand();
        
        navPanel.setActiveLink('settings/locations');
        Ext.util.History.resumeState(false); // false to discard any changes to state        
        Ext.resumeLayouts(true);
        me.application.getController('Viewport').loadCard(me.getManager());
    },
    
    // event handlers
    onManagerShow: function(managerPanel) {
        var rootNode = managerPanel.getRootNode();

        if (!rootNode.isLoaded() && !rootNode.isLoading()) {
            managerPanel.setLoading('Loading locations&hellip;');
            rootNode.expand(false, function() {
                managerPanel.setLoading(false);
            });
        }

        Ext.util.History.pushState('settings/locations', 'Locations &mdash; Settings');
    },

    onLocationContextMenu: function(tree, record, item, index, ev) {
        ev.stopEvent();

        var menu = this.getMenu();

        menu.setRecord(record);
        menu.showAt(ev.getXY());
    },

    onCreateLocationClick: function() {
        var me = this;
        
        Ext.Msg.prompt('Create Location', 'Enter a name for the new location:', function(btn, text) {
            var newGroup;
            
            text = Ext.String.trim(text);
            
            if (btn == 'ok' && text) {
                newGroup = me.getLocationModel().create({
                    Title: text
                });

                newGroup.save({
                    success: function() {
                        me.getLocationsTreeStore().getRootNode().appendChild(newGroup);
                        me.getLocationsStore().add(newGroup);
                    }
                });
            }
        });
    },

    onCreateSublocationClick: function(menuItem, event) {
        var me = this,
            parentGroup = menuItem.parentMenu.getRecord();

        Ext.Msg.prompt('Create sublocation', 'Enter a name for the new sublocation:', function(btn, text) {
            var newGroup;
            
            text = Ext.String.trim(text);
            
            if (btn == 'ok' && text) {
                newGroup = me.getLocationModel().create({
                    Title: text,
                    ParentID: parentGroup.get('ID')
                });

                newGroup.save({
                    success: function() {
                        parentGroup.set('leaf', false);
                        parentGroup.appendChild(newGroup);
                        parentGroup.expand();
                        me.getLocationsStore().add(newGroup);
                    }
                });
            }
        });
    },

    onDeleteLocationClick: function() {
        var me = this,
            node = me.getMenu().getRecord(),
            parentNode = node.parentNode;

        Ext.Msg.confirm('Deleting Group', 'Are you sure you want to delete this group?', function(btn) {
            if (btn == 'yes') {
                node.destroy({
                    success: function() {
                        if (!parentNode.childNodes.length) {
                            parentNode.set('leaf', true);
                        }
                    }
                });
            }
        });
    },
    
    onBrowseLocationsClick: function() {
        var me = this,
            node = me.getMenu().getRecord();

//        Ext.util.History.add(['people', 'search', 'group:' + node.get('Handle')]);
    }
});