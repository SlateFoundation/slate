/*jslint browser: true, undef: true, white: true, laxbreak: true *//*global Ext*/
Ext.define('SlateAdmin.controller.progress.narratives.Mailer', {
    extend: 'Ext.app.Controller',

    views: [
        'progress.narratives.Mailer',
        'progress.narratives.MailerGrid'
    ],

    stores: [
        'Terms',
        'people.Advisors',
        'people.People',
        'progress.narratives.Students',
        'progress.narratives.Reports'
    ],

    routes: {
        'progress/narratives/email': 'showNarrativeMailer'
    },

    refs: {
        progressNavPanel: 'progress-navpanel',

        narrativesMailer: {
            selector: 'progress-narratives-mailer',
            autoCreate: true,

            xtype: 'progress-narratives-mailer'
        },
        narrativesMailerForm: 'progress-narratives-mailer form#filterForm',
        narrativesMailerGrid: 'progress-narratives-mailergrid',
        narrativesMailerPreviewBox: 'progress-narratives-mailer component#previewBox',
        termCombo: 'progress-narratives-mailer combo#termCombo',
        studentCombo: 'progress-narratives-mailer combo#studentCombo'
    },

    control: {
        'progress-narratives-mailer button[action=clear-filters]': {
            click: 'onClearFiltersClick'
        },
        'progress-narratives-mailer button[action=search]': {
            click: 'onSearchClick'
        },
        termCombo: {
            afterrender: 'onTermComboRender'
        },
        studentCombo: {
            beforequery: 'onStudentComboBeforeQuery'
        },
        narrativesMailerGrid: {
            select: 'onNarrativesMailerGridSelect'
        }
    },

    // controller template methods
    init: function() {
        var me = this;

        me.listen({
            store: {
                '#progress.narratives.Reports': {
                    load: me.onReportStoreLoad,
                    scope: me
                }
            }
        });
    },

    // route handler
    showNarrativeMailer: function () {
        var me = this,
            navPanel = me.getProgressNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('progress/narratives/printing');
        navPanel.expand();
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getNarrativesMailer());

        Ext.resumeLayouts(true);
    },

    // event handlers
    onReportStoreLoad: function (store,records) {
        var total = this.getNarrativesMailerGrid().down('#interimEmailTotalText');

        total.setText(records.length + ' Report' + (records.length == 1 ? '    ' : 's'));
    },

    onTermComboRender: function (combo) {
        var me = this,
            mailer = me.getNarrativesMailer(),
            store = combo.getStore();

        store.addListener('load',me.onTermComboStoreLoad,me);

        if(!store.isLoaded()) {
            mailer.setLoading('Loading terms&hellip;');
            store.load();
        }
    },

    onTermComboStoreLoad: function () {
        var me = this,
            mailer = me.getNarrativesMailer(),
            combo = me.getTermCombo(),
            store = combo.getStore();

        if (!combo.getValue()) {
            combo.setValue(store.getReportingTerm().getId());
            mailer.setLoading(false);
        }
    },

    onSearchClick: function () {
        var me = this,
            formValues = me.getNarrativesMailerForm().getForm().getValues(),
            recipients = formValues.Recipients,
            store = me.getProgressNarrativesReportsStore(),
            filters = [],
            params = { include: 'Student,EmailRecipients' };

        /*
         * TODO: - toString() can be removed when/if this pull request is merged:
         * https://github.com/JarvusInnovations/emergence-apikit/pull/4
         */
        // Set filters
        if (formValues.termID) {
            filters.push({property: 'termID', value: formValues.termID.toString()});
        }

        if (formValues.advisorID) {
            filters.push({property: 'advisorID', value: formValues.advisorID.toString()});
        }

        if (formValues.studentID) {
            filters.push({property: 'studentID', value: formValues.studentID.toString()});
        }

        if (formValues.authorID) {
            filters.push({property: 'authorID', value: formValues.authorID.toString()});
        }

        store.clearFilter(true);
        store.setFilters(filters);

        // add recipients to params if requested
        if (recipients) {
            if (Ext.isArray(recipients)) {
                recipients = recipients.join(',');
            }

            params = Ext.apply({
                Recipients: recipients
            },params);
        }

        store.getProxy().setExtraParams(params);
        store.load();

    },

    onClearFiltersClick: function () {
        var me = this,
            store = me.getProgressNarrativesReportsStore(),
            preview = document.getElementById(me.getNarrativesMailerPreviewBox().iframeEl.dom.id);

        me.getNarrativesMailerForm().getForm().reset();
        store.clearFilter(true);
        store.removeAll();
        preview.src = 'about:blank';
    },

    onStudentComboBeforeQuery: function(queryPlan) {
        if (queryPlan.query) {
            queryPlan.query += ' class:Student';
        } else {
            queryPlan.query += 'class:Student';
        }
    },

    onNarrativesMailerGridSelect: function (row, rec) {
        var me = this,
            previewBox = me.getNarrativesMailerPreviewBox();

        query = {
            q: 'narrativeID:'+rec.get('ID')
        };

        previewBox.enable();
        previewBox.setLoading({msg: 'Loading previewreports&hellip;'});

        previewBox.iframeEl.on('load', function () {
            me.fireEvent('previewload', me, previewBox);
            previewBox.setLoading(false);
        }, me, { single: true, delay: 10 });

        SlateAdmin.API.request({
            url: '/progress/narratives/reports',
            headers: {
                'Accept': 'text/html'
            },
            params: query,
            scope: me,
            success: function (res) {
                var doc = document.getElementById(previewBox.iframeEl.dom.id).contentWindow.document;

                doc.open();
                doc.write(res.responseText);
                doc.close();
            }
        });
    }

});
