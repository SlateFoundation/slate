/**
 * Controls any and all open Editor tabs
 *
 * Responsibilities:
 * - Handle `#/*` routes, switching to a new or existing diff tab
 * - Load content if needed when an editor tab is activated
 * - Handle global save hotkey and save buttons to save content
 * - Manage state of global save button in response to current editor tab's dirtiness
 * - Reflect editor dirty state to its tab's classes
 */
Ext.define('EmergenceEditor.controller.Editors', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.util.KeyMap',
        'Ext.window.MessageBox',

        /* global EmergenceEditor */
        'EmergenceEditor.DAV',

        /* global Jarvus */
        'Jarvus.ace.Util',
        'Jarvus.ace.Loader'
    ],


    // controller config
    views: [
        'tab.Editor'
    ],

    routes: {
        '/:token': {
            action: 'showToken',
            conditions: {
                ':token': '(.+)'
            }
        }
    },

    refs: {
        saveBtn: 'emergence-toolbar button[action=save]',

        tabPanel: 'emergence-tabpanel',

        editorTab: {
            forceCreate: true,

            xtype: 'emergence-tab-editor',
            title: 'Editor'
        }
    },

    control: {
        tabPanel: {
            tabchange: 'onTabChange'
        },
        'emergence-tab-editor': {
            activate: 'onEditorActivate',
            dirtychange: 'onEditorDirtyChange'
        },
        saveBtn: {
            click: 'onSaveBtnClick'
        }
    },


    // controller lifecycle
    onLaunch: function() {
        var me = this;

        // init keymap
        me.keyMap = Ext.create('Ext.util.KeyMap', {
            target: document,
            binding: [{
                key: 's',
                ctrl: true,
                defaultEventAction: 'stopEvent',
                scope: me,
                handler: me.onSaveKey
            }]
        });
    },


    // route handlers
    showToken: function(token) {
        var me = this,
            tabPanel = me.getTabPanel(),
            editorTab = tabPanel.findUsableTab('emergence-tab-editor', token);

        if (editorTab) {
            editorTab.setToken(token);
        } else {
            editorTab = tabPanel.add(me.getEditorTab({
                token: token
            }));
        }

        tabPanel.setActiveTab(editorTab);
    },


    // event handlers
    onTabChange: function(tabPanel, card) {
        var saveBtn = this.getSaveBtn();

        if (saveBtn) {
            saveBtn.setDisabled(!card.isSavable || !card.isDirty());
        }
    },

    onEditorActivate: function(editorTab) {
        if (!editorTab.getLoadNeeded()) {
            return;
        }

        editorTab.setLoadNeeded(false);
        editorTab.setLoading({
            msg: 'Opening ' + editorTab.getTitle() + '&hellip;'
        });

        EmergenceEditor.DAV.downloadFile({
            url: editorTab.getPath(),
            revision: editorTab.getRevision()
        }).then(function(response) {
            editorTab.loadContent(response.responseText, function () {
                editorTab.setLoading(false);
            });
        });
    },

    onEditorDirtyChange: function(editorTab, dirty) {
        var tabs = editorTab.ownerCt;

        editorTab.tab.toggleCls('is-dirty', dirty);
        this.getSaveBtn().setDisabled(!dirty);

        if (tabs) {
            tabs.updateLayout();
        }
    },

    onSaveBtnClick: function() {
        this.saveActive();
    },

    onSaveKey: function() {
        this.saveActive();
    },


    // local methods
    saveActive: function() {
        var card = this.getTabPanel().getActiveTab(),
            tab = card.tab;

        if (!card.isXType('emergence-tab-editor') || !card.isDirty()) {
            return;
        }

        tab.addCls('is-saving');

        Jarvus.ace.Loader.withAce(function(ace) {
            card.withEditor(function(acePanel, aceEditor, aceSession) {
                ace.require('ace/ext/whitespace').trimTrailingSpace(aceSession, { trimEmpty: true })

                card.withContent(function(content) {
                    EmergenceEditor.DAV.uploadFile(card.getPath(), content).then(function(response) {
                        tab.removeCls('is-saving');
                        card.markClean();
                    }).catch(function(response) {
                        if (response.status) {
                            Ext.Msg.alert('Failed to save', 'Your changes failed to save to the server');
                        }
                    });
                });
            });
        });
    }
});