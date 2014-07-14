/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.Groups', {
    extend: 'Ext.app.Controller',
    
    
    // controller config
    views: [
        'groups.Manager',
        'groups.Menu'
    ],
    
    stores: [
        'people.Groups'
    ],
    
    models: [
        'person.Group'
    ],
    
    routes: {
        'settings/groups': 'showManager'
    },
    
    refs: [{
        ref: 'settingsNavPanel',
        selector: 'settings-navpanel'
    },{
        ref: 'manager',
        selector: 'groups-manager',
        autoCreate: true,
        
        xtype: 'groups-manager'
    },{
        ref: 'menu',
        selector: 'groups-menu',
        autoCreate: true,
        
        xtype: 'groups-menu'
    }],
    
	
	// controller template methods
    init: function() {
        var me = this;

        me.control({
            'groups-manager': {
                show: me.onManagerShow,
                itemcontextmenu: me.onGroupContextMenu
            },
            'groups-manager button[action=create-organization]': {
                click: me.onCreateOrganizationClick
            },
            'groups-menu menuitem[action=browse-members]': {
                click: me.onBrowseMembersClick
            },
            'groups-menu menuitem[action=create-subgroup]': {
                click: me.onCreateSubgroupClick
            },
            'groups-menu menuitem[action=delete-group]': {
                click: me.onDeleteGroupClick
            }
        });
    },
    
    
    // route handlers
    showManager: function() {
        var me = this,
            navPanel = me.getSettingsNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('settings/groups');
        navPanel.expand(false);
        Ext.util.History.resumeState(false); // false to discard any changes to state
        
        me.application.getController('Viewport').loadCard(me.getManager());

        Ext.resumeLayouts(true);
    },
    
    
    // event handlers
    onManagerShow: function(managerPanel) {
        var rootNode = managerPanel.getRootNode();

        if (!rootNode.isLoaded()) {
            managerPanel.setLoading('Loading groups&hellip;');
            rootNode.expand(false, function() {
                managerPanel.setLoading(false);
            });
        }

        Ext.util.History.pushState('settings/groups', 'Groups &mdash; Settings');
    },

    onGroupContextMenu: function(tree, record, item, index, ev) {
        ev.stopEvent();

        var menu = this.getMenu();

        menu.setRecord(record);
        menu.showAt(ev.getXY());
    },

    onCreateOrganizationClick: function() {
        var me = this;
        
        Ext.Msg.prompt('Create organization', 'Enter a name for the new organization:', function(btn, text) {
            var newGroup;
            
            if (btn == 'ok') {
                newGroup = me.getGroupModel().create({
                    Name: text,
                    Class: 'Organization'
                });

                newGroup.save({
                    success: function() {
                        me.getGroupsStore().getRootNode().appendChild(newGroup);
                    }
                });
            }
        });
    },

    onCreateSubgroupClick: function(menuItem, event) {
        var me = this,
            parentGroup = menuItem.parentMenu.getRecord();

        Ext.Msg.prompt('Create subgroup', 'Enter a name for the new subgroup:', function(btn, text) {
            var newGroup;
            
            if (btn == 'ok') {
                newGroup = me.getGroupModel().create({
                    Name: text,
                    ParentID: parentGroup.get('ID'),
                    Class: 'Group'
                });

                newGroup.save({
                    success: function() {
                        parentGroup.set('leaf', false);
                        parentGroup.appendChild(newGroup);
                        parentGroup.expand();
                    }
                });
            }
        });
    },

    onDeleteGroupClick: function() {
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
    
    onBrowseMembersClick: function() {
        var me = this,
            node = me.getMenu().getRecord();

        Ext.util.History.add(['people', 'search', {group: node.get('Handle')}]);
    }
});