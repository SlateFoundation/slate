/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.Statuses', {
    extend: 'Ext.app.Controller',
    
    // controller config
    views: [
        'assets.statuses.Manager',
        'assets.statuses.Menu'
    ],
    
    stores: [
        'assets.Statuses',
        'assets.StatusesTree'
    ],
    
    models: [
        'asset.Status'
    ],
    
    routes: {
        'settings/statuses': 'showManager'
    },
    
    refs: [{
        ref: 'settingsNavPanel',
        selector: 'settings-navpanel'
    },{
        ref: 'manager',
        selector: 'assets-statuses-manager',
        autoCreate: true,
        
        xtype: 'assets-statuses-manager'
    },{
        ref: 'menu',
        selector: 'assets-statuses-menu',
        autoCreate: true,
        
        xtype: 'assets-statuses-menu'
    }],
    
    // controller template methods
    init: function() {
        var me = this;

        me.control({
            'assets-statuses-manager': {
                show: me.onManagerShow,
                itemcontextmenu: me.onStatusContextMenu
            },
            'assets-statuses-manager button[action=create-status]': {
                click: me.onCreateStatusClick
            },
            'assets-statuses-menu menuitem[action=browse-statuses]': {
                click: me.onBrowseStatusesClick
            },
            'assets-statuses-menu menuitem[action=create-status]': {
                click: me.onCreateSubstatusesClick
            },
            'assets-statuses-menu menuitem[action=delete-status]': {
                click: me.onDeleteStatusClick
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
            navPanel = me.getSettingsNavPanel(),
            manager = me.getManager();

        Ext.suspendLayouts();
        Ext.util.History.suspendState();            
    
        navPanel.expand();

        navPanel.setActiveLink('settings/statuses');
        Ext.util.History.resumeState(false); // false to discard any changes to state        
        Ext.resumeLayouts(true);
        me.application.getController('Viewport').loadCard(manager);

    },
    
    // event handlers
    onManagerShow: function(managerPanel) {
        var rootNode = managerPanel.getRootNode();

        if (!rootNode.isLoaded()) {
            managerPanel.setLoading('Loading assets statuses&hellip;');
            rootNode.expand(false, function() {
                managerPanel.setLoading(false);
            });
        }

        Ext.util.History.pushState('settings/statuses', 'Asset Status &mdash; Settings');
    },

    onStatusContextMenu: function(tree, record, item, index, ev) {
        ev.stopEvent();

        var menu = this.getMenu();

        menu.setRecord(record);
        menu.showAt(ev.getXY());
    },

    onCreateStatusClick: function() {
        var me = this;
        
        Ext.Msg.prompt('Create Status', 'Enter a name for the new status:', function(btn, text) {
            var newGroup;
            
            text = Ext.String.trim(text);
            
            if (btn == 'ok' && text) {
                newGroup = me.getAssetStatusModel().create({
                    Title: text,
                    Class: 'Slate\\Assets\\Status'
                });

                newGroup.save({
                    success: function() {
                        //todo: append to asset treenode store
                        me.getAssetsStatusesTreeStore().getRootNode().appendChild(newGroup);
                        me.getAssetsStatusesStore().add(newGroup);
                    }
                });
            }
        });
    },

    onCreateSubstatusesClick: function(menuItem, event) {
        var me = this,
            parentGroup = menuItem.parentMenu.getRecord();

        Ext.Msg.prompt('Create substatus', 'Enter a name for the new substatus:', function(btn, text) {
            var newGroup;
            
            text = Ext.String.trim(text);
            
            if (btn == 'ok' && text) {
                newGroup = me.getAssetStatusModel().create({
                    Title: text,
                    Class: 'Slate\\Assets\\Status',
                    ParentID: parentGroup.get('ID')
                });

                newGroup.save({
                    success: function() {
                        parentGroup.set('leaf', false);
                        parentGroup.appendChild(newGroup);
                        parentGroup.expand();
                        me.getAssetsStatusesStore().add(newGroup);
                        //todo: set asset treenode store node to loaded=false
                    }
                });
            }
        });
    },

    onDeleteStatusClick: function() {
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
    
    onBrowseStatusesClick: function() {
        var me = this,
            node = me.getMenu().getRecord();

//        Ext.util.History.add(['people', 'search', 'group:' + node.get('Handle')]);
    }
});