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
        selector: 'terms-form',
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
                createsubtermclick: me.onCreateSubtermClick,
                deletetermclick: me.onDeleteTermClick
            },
            'terms-manager button[action=create-term]': {
                click: me.onCreateTermClick
            },
            'terms-form-window button[action="save"]': {
                click: me.onSaveTermClick
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

    onCreateTermClick: function() {
        var me = this,
            win = me.getTermsFormWindow();

        win.down('form').reset();
        win.show();

/*
        Ext.Msg.prompt('Create organization', 'Enter a name for the new organization:', function(btn, text) {
            var newTerm;

            text = Ext.String.trim(text);

            if (btn == 'ok' && text) {
                newTerm = me.getTermModel().create({
                    Name: text,
                    namesPath: '/' + text
                });

                newTerm.save({
                    success: function() {
                        me.getTermsTreeStore().getRootNode().appendChild(newTerm);
                        me.getTermsStore().add(newTerm);
                    }
                });
            }
        });
*/
    },

    onSaveTermClick: function() {
        var me = this,
            win = me.getTermsFormWindow(),
            form = win.down('form'),
            term;

        term = me.getTermModel().create(form.getValues());

        if (term.isValid()) {

            term.set('titlesPath', '/' + term.get('Title'));
            term.set('leaf', true);

            term.save({
                success: function() {
                    me.getTermsTreeStore().getRootNode().appendChild(term);
                    me.getTermsStore().add(term);
                }
            });
        }
    },

    onCreateSubtermClick: function(grid,rec) {
        var me = this,
            parentTerm = rec;

        Ext.Msg.prompt('Create term', 'Enter a name for the new term:', function(btn, text) {
            var newTerm;

            text = Ext.String.trim(text);

            if (btn == 'ok' && text) {
                newTerm = me.getTermModel().create({
                    Name: text,
                    ParentID: parentTerm.get('ID'),
                    Class: 'Term',
                    titlesPath: parentTerm.get('titlesPath') + '/' + text
                });

                newTerm.save({
                    success: function() {
                        parentTerm.set('leaf', false);
                        parentTerm.appendChild(newTerm);
                        parentTerm.expand();
                        me.getTermsStore().add(newTerm);
                    }
                });
            }
        });
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
        console.log('onBrowseCoursesClick');
        Ext.util.History.add(['course-sections', 'search', 'term:' + rec.get('Handle')]);
    }

});
