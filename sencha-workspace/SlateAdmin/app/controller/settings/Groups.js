/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.Groups', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'groups.Manager'
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
    }],

    control: {
        'groups-manager': {
            show: 'onManagerShow',
            browsemembersclick: 'onBrowseMembersClick',
            createsubgroupclick: 'onCreateSubgroupClick',
            deletegroupclick: 'onDeleteGroupClick'
        },
        'groups-manager button[action=create-organization]': {
            click: 'onCreateOrganizationClick'
        }
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

    onCreateOrganizationClick: function() {
        var me = this,
            manager = me.getManager(),
            treeStore = manager.getStore();

        Ext.Msg.prompt('Create Organization', 'Enter a name for the new organization:', function(btn, text) {
            var newGroup;

            text = Ext.String.trim(text);

            if (btn == 'ok' && text) {
                newGroup = me.getPersonGroupModel().create({
                    Name: text,
                    Class: 'Emergence\\People\\Groups\\Organization',
                    leaf: true,
                    namesPath: '/' + text
                });

                newGroup.save({
                    success: function() {
                        treeStore.getRootNode().appendChild(newGroup);
                        me.getPeopleGroupsStore().add(newGroup);
                    }
                });
            }
        });
    },

    onCreateSubgroupClick: function(grid,rec) {
        var me = this,
            parentGroup = rec;

        Ext.Msg.prompt('Create Subgroup', 'Enter a name for the new subgroup:', function(btn, text) {
            var newGroup;

            text = Ext.String.trim(text);

            if (btn == 'ok' && text) {
                newGroup = me.getPersonGroupModel().create({
                    Name: text,
                    ParentID: parentGroup.get('ID'),
                    Class: 'Emergence\\People\\Groups\\Group',
                    leaf: true,
                    namesPath: parentGroup.get('namesPath') + '/' + text
                });

                newGroup.save({
                    success: function() {
                        parentGroup.set('leaf', false);
                        parentGroup.appendChild(newGroup);
                        parentGroup.expand();
                        me.getPeopleGroupsStore().add(newGroup);
                    }
                });
            }
        });
    },

    onDeleteGroupClick: function(grid,rec) {
        var parentNode = rec.parentNode;

        Ext.Msg.confirm('Deleting Group', 'Are you sure you want to delete this group?', function(btn) {
            if (btn == 'yes') {
                rec.erase({
                    success: function() {
                        if (!parentNode.childNodes.length) {
                            parentNode.set('leaf', true);
                        }
                    }
                });
            }
        });
    },

    onBrowseMembersClick: function(grid,rec) {
        Ext.util.History.pushState(['people', 'search', 'group:' + rec.get('Handle')]);
    }
});
