/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.Terms', {
    extend: 'Ext.app.Controller',

    // controller config
    views: [
        'settings.terms.Manager'
    ],

    stores: [
        'Terms',
        'TermsTree'
    ],

    models: [
        'Term'
    ],

    routes: {
        'settings/terms': 'showManager'
    },

    refs: [{
        ref: 'settingsNavPanel',
        selector: 'settings-navpanel'
    },{
        ref: 'manager',
        selector: 'terms-manager',
        autoCreate: true,

        xtype: 'terms-manager'
    }],


	// controller template methods
    init: function() {
        var me = this;

        me.control({
            'terms-manager': {
                show: me.onManagerShow,
                edit: me.onCellEditorEdit
            },
            'terms-manager button[action=create-term]': {
                click: me.onCreateTermClick
            }
        });
    },


    // route handlers
    showManager: function() {
        var me = this,
            navPanel = me.getSettingsNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('settings/terms');
        navPanel.expand(false);
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getManager());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onManagerShow: function(managerPanel) {
        var store = Ext.getStore('Terms');

        if (!store.isLoaded()) {
            managerPanel.setLoading('Loading terms&hellip;');
            store.load({
                callback: function() {
                    managerPanel.setLoading(false);
                }
            });
        }

        Ext.util.History.pushState('settings/terms', 'Terms &mdash; Settings');
    },

    onCreateTermClick: function() {
        //var me = this;
        console.log('onCreateTermClick- implement me');

    },

    onCellEditorEdit: function(editor, e) {
        var rec = e.record;

        if (rec.isValid()) {
            rec.save();
        }
    }

});
