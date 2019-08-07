/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.Terms', {
    extend: 'Ext.app.Controller',

    // controller config
    views: [
        'settings.terms.Manager',
        'settings.terms.Form'
    ],

    stores: [
        'Terms@Slate.store'
    ],

    routes: {
        'settings/terms': 'showManager'
    },

    refs: {
        settingsNavPanel: 'settings-navpanel',
        manager: {
            selector: 'terms-manager',
            autoCreate: true,

            xtype: 'terms-manager'
        },
        termsFormWindow: {
            selector: 'terms-form-window',
            autoCreate: true,

            xtype: 'terms-form-window'
        }
    },


	control: {
        manager: {
            activate: 'onManagerPanelActivate',
            edit: 'onCellEditorEdit',
            browsecoursesclick: 'onBrowseCoursesClick',
            createtermclick: 'onCreateTermClick',
            deletetermclick: 'onDeleteTermClick'
        },
        'terms-manager button[action=create-term]': {
            click: 'onCreateTermClick'
        },
        'terms-form-window button[action="save"]': {
            click: 'onSaveTermClick'
        },
        'terms-form-window form': {
            fieldvaliditychange: 'setFormValidity',
            fielderrorchange: 'setFormValidity'
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

        me.application.getController('Viewport').loadCard(me.getManager());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onManagerPanelActivate: function(managerPanel) {
        this.getTermsStore().loadIfDirty();

        Ext.util.History.pushState('settings/terms', 'Terms &mdash; Settings');
    },

    onCreateTermClick: function(grid, term) {
        var me = this,
            formWindow = me.getTermsFormWindow(),
            form = formWindow.down('form'),
            titleField = form.down('textfield[name="Title"]'),
            saveButton = formWindow.down('button[action="save"]'),
            parentDisplayField = form.down('displayfield[name="ParentDisplay"]');

        form.suspendEvents();
        form.reset();
        form.resumeEvents();

        if (term && term.isModel) {
            // This term will have a parent
            form.getForm().setValues({
                ParentID: term.get('ID'),
                ParentDisplay: term.get('Title'),
                TitlesPath: '/' + term.get('Title'),
                StartDate: term.get('StartDate'),
                EndDate: term.get('EndDate')
            });
            formWindow.setParentTerm(term);
            parentDisplayField.show();
        } else {
            // This term has no parent
            form.getForm().setValues({
                TitlesPath: ''
            });
            formWindow.setParentTerm(null);
            parentDisplayField.hide();
        }

        saveButton.disable();

        formWindow.show(null, function() {
            titleField.focus();
        });
    },

    onCellEditorEdit: function(editor, e) {
        var record = e.record;

        if (record.isValid()) {
            record.save();
        }
    },

    onSaveTermClick: function() {
        var me = this,
            treeStore = me.getManager().getStore(),
            formWindow = me.getTermsFormWindow(),
            parentTerm = formWindow.getParentTerm(),
            form = formWindow.down('form'),
            term = treeStore.getModel().create(form.getValues());

        if (term.isValid()) {
            term.set({
                ID: null,
                leaf: true,
                TitlesPath: term.get('TitlesPath') + '/' + term.get('Title')
            });

            term.save({
                success: function() {
                    formWindow.close();

                    if (parentTerm) {
                        parentTerm.set('leaf', false);
                        parentTerm.appendChild(term);
                        parentTerm.expand();
                    } else {
                        treeStore.getRootNode().appendChild(term);
                    }
                }
            });
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

    onBrowseCoursesClick: function(grid,rec) {
        Ext.util.History.pushState(['course-sections', 'search', 'term:' + rec.get('Handle')]);
    },

    setFormValidity: function(form) {
        var saveButton = form.up('window').down('button[action="save"]');

        if (form.isValid()) {
            saveButton.enable();
        } else {
            saveButton.disable();
        }
    }

});
