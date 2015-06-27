/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.Terms', {
    extend: 'Ext.app.Controller',

    // controller config
    views: [
        'settings.terms.Manager',
        'settings.terms.Form'
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
    },{
        ref: 'termsFormWindow',
        selector: 'terms-form-window',
        autoCreate: true,

        xtype: 'terms-form-window'
    }],


	// controller template methods
    init: function() {
        var me = this;

        me.control({
            'terms-manager': {
                show: me.onManagerShow,
                edit: me.onCellEditorEdit,
                browsecoursesclick: me.onBrowseCoursesClick,
                createtermclick: me.onCreateTermClick,
                deletetermclick: me.onDeleteTermClick
            },
            'terms-manager button[action=create-term]': {
                click: me.onCreateTermClick
            },
            'terms-form-window button[action="save"]': {
                click: me.onSaveTermClick
            },
            'terms-form-window form': {
                fieldvaliditychange: me.setFormValidity,
                fielderrorchange: me.setFormValidity
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

    onCellEditorEdit: function(editor, e) {
        var rec = e.record;

        if (rec.isValid()) {
            rec.save();
        }
    },

    onCreateTermClick: function(grid,rec) {
        var me = this,
            win = me.getTermsFormWindow(),
            form = win.down('form'),
            saveButton = win.down('button[action="save"]');
            parentDisplayField = form.down('displayfield[name="ParentDisplay"]');

        form.reset();

        if (rec.get && rec.get('ID')) {
            // This term will have a parent
            form.getForm().setValues({
                ParentID: rec.get('ID'),
                ParentDisplay: rec.get('Title'),
                TitlesPath: '/' + rec.get('Title')
            });
            win.setParentTerm(rec);
            parentDisplayField.show();
        } else {
            // This term has no parent
            form.getForm().setValues({
                TitlesPath: ''
            });
            win.setParentTerm(null);
            parentDisplayField.hide();
        }

        saveButton.disable();
        win.show();
    },

    onSaveTermClick: function() {
        var me = this,
            win = me.getTermsFormWindow(),
            parentTerm = win.getParentTerm(),
            form = win.down('form'),
            term;

        term = me.getTermModel().create(form.getValues());

        if (term.isValid()) {

            term.set('ID', null);
            term.set('leaf', true);
            term.set('TitlesPath', term.get('TitlesPath') + '/' + term.get('Title'));

            term.save({
                success: function() {
                    win.close();

                    if (parentTerm) {
                        parentTerm.set('leaf', false);
                        parentTerm.appendChild(term);
                        parentTerm.expand();
                    } else {
                        me.getTermsTreeStore().getRootNode().appendChild(term);
                    }
                    me.getTermsStore().add(term);
                }
            });
        }
    },

    onDeleteTermClick: function(grid,rec) {
        var parentNode = rec.parentNode;

        Ext.Msg.confirm('Deleting Term', 'Are you sure you want to delete this term?', function(btn) {
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

    onBrowseCoursesClick: function(grid,rec) {
        Ext.util.History.add(['course-sections', 'search', 'term:' + rec.get('Handle')]);
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
