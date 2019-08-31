/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.Terms', {
    extend: 'Ext.app.Controller',

    // controller config
    views: [
        'settings.terms.Manager'
    ],

    stores: [
        'Terms@Slate.store'
    ],

    routes: {
        'settings/terms': 'showManager'
    },

    refs: {
        settingsNavPanel: 'settings-navpanel',
        managerPanel: {
            selector: 'terms-manager',
            autoCreate: true,

            xtype: 'terms-manager'
        }
    },


	control: {
        managerPanel: {
            activate: 'onManagerPanelActivate',
            edit: 'onCellEditorEdit',
            browsecoursesclick: 'onBrowseCoursesClick',
            createtermclick: 'onCreateChildClick',
            deletetermclick: 'onDeleteTermClick'
        },
        'terms-manager button[action=create-term]': {
            click: 'onCreateClick'
        }
    },

    listen: {
        store: {
            '#Terms': {
                beforeload: 'onBeforeStoreLoad',
                load: 'onStoreLoad'
            }
        }
    },


    // route handlers
    showManager: function() {
        var me = this,
            navPanel = me.getSettingsNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('settings/terms');
        navPanel.expand();
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getManagerPanel());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onManagerPanelActivate: function(managerPanel) {
        this.getTermsStore().loadIfDirty();

        Ext.util.History.pushState('settings/terms', 'Terms &mdash; Settings');
    },

    onCreateClick: function() {
        var me = this,
            managerPanel = me.getManagerPanel(),
            record = managerPanel.getRootNode().insertChild(0, { leaf: true });

        managerPanel.getPlugin('cellediting').startEdit(record, 0);
    },

    onCreateChildClick: function(managerPanel, parentRecord) {
        var managerPanel = this.getManagerPanel(),
            cellEditing = managerPanel.getPlugin('cellediting'),
            location = parentRecord.insertChild(0, {
                StartDate: parentRecord.get('StartDate'),
                EndDate: parentRecord.get('EndDate'),
                ParentID: parentRecord.getId(),
                leaf: true
            });

        managerPanel.expandRecord(parentRecord, function() {
            Ext.defer(cellEditing.startEdit, 50, cellEditing, [location, 0]);
        });
    },

    onCellEditorEdit: function(editor, e) {
        var record = e.record;

        if (record.isValid()) {
            record.save();
        }
    },

    onDeleteTermClick: function(grid, record) {
        var parentNode = record.parentNode;

        grid.setSelection(record);

        Ext.Msg.confirm('Deleting Term', 'Are you sure you want to delete this term?', function(btn) {
            if (btn != 'yes') {
                return;
            }

            record.erase({
                success: function() {
                    parentNode.set('leaf', 0 == parentNode.childNodes.length);
                }
            });
        });
    },

    onBrowseCoursesClick: function(grid, record) {
        Ext.util.History.pushState(['course-sections', 'search', 'term:' + record.get('Handle')]);
    },

    onBeforeStoreLoad: function() {
        this.getManagerPanel().setLoading('Loading terms&hellip;');
    },

    onStoreLoad: function() {
        this.getManagerPanel().setLoading(false);
    }
});
