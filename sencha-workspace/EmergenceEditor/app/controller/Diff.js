/**
 * Controls any and all open Diff tabs
 *
 * Responsibilities:
 * - Handle `#diff?*` routes, switching to a new or existing diff tab
 * - Load content if needed when a diff tab is activated
 */
Ext.define('EmergenceEditor.controller.Diff', {
    extend: 'Ext.app.Controller',
    require: [
        'Ext.Promise',

        /* global EmergenceEditor */
        'EmergenceEditor.DAV'
    ],


    // controller config
    views: [
        'tab.Diff'
    ],

    routes: {
        'diff\\?:token': {
            action: 'showToken',
            conditions: {
                ':token': '(.+)'
            }
        }
    },

    refs: {
        tabPanel: 'emergence-tabpanel',

        diffTab: {
            forceCreate: true,

            xtype: 'emergence-tab-diff',
            title: 'Compare'
        }
    },

    control: {
        'emergence-tab-diff': {
            activate: 'onDiffActivate'
        }
    },


    // route handlers
    showToken: function(token) {
        var me = this,
            tabPanel = me.getTabPanel(),
            diffTab = tabPanel.findUsableTab('emergence-tab-diff', token);

        if (diffTab) {
            diffTab.setToken(token);
        } else {
            diffTab = tabPanel.add(me.getDiffTab({
                token: token
            }));
        }

        tabPanel.setActiveTab(diffTab);
    },


    // event handlers
    onDiffActivate: function(diffTab) {
        if (!diffTab.getLoadNeeded()) {
            return;
        }

        diffTab.setLoadNeeded(false);
        diffTab.setLoading({
            msg: 'Opening ' + diffTab.getTitle() + '&hellip;'
        });

        Ext.Promise.all([
            EmergenceEditor.DAV.downloadFile({
                url: diffTab.getLeftPath(),
                revision: diffTab.getLeftRevision()
            }),
            EmergenceEditor.DAV.downloadFile({
                url: diffTab.getRightPath(),
                revision: diffTab.getRightRevision()
            })
        ]).then(function(responses) {
            diffTab.loadContent(responses[0].responseText, responses[1].responseText, function () {
                diffTab.setLoading(false);
            });
        });
    }
});