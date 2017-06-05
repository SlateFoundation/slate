Ext.define('SlateAdmin.controller.people.Progress', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',

        /* global SlateAdmin */
        'SlateAdmin.API'
    ],


    views: [
        'people.details.Progress',
        'people.details.progress.Previewer',

        'people.details.progress.note.EditWindow'
    ],

    stores: [
        'people.ProgressReports',
        'people.progress.NoteRecipients'
    ],

    models: [
        'person.progress.ProgressNote'
    ],

    refs: {
        peopleManager: 'people-manager',

        progressPanel: {
            selector: 'people-details-progress',
            autoCreate: true,

            xtype: 'people-details-progress'
        },
        progressList: 'people-details-progress dataview',
        classesSelector: 'people-details-progress #classesSelector',
        termSelector: 'people-details-progress #termSelector',

        reportPreviewer: {
            selector: 'people-details-progress-previewer',
            autoCreate: true,

            xtype: 'people-details-progress-previewer'
        },

        progressNoteEditorWindow: {
            selector: 'people-details-progress-note-editwindow',
            autoCreate: true,

            xtype: 'people-details-progress-note-editwindow'
        },
        noteEditorCt: 'people-details-progress-note-editwindow #progressNoteCt',
        progressNoteForm: 'people-details-progress-note-editwindow people-details-progress-note-form',
        progressNoteViewer: 'people-details-progress-note-editwindow people-details-progress-note-viewer',
        progressNoteRecipientGrid: 'people-details-progress-note-editwindow people-details-progress-note-recipientgrid'
    },

    control: {
        'people-manager #detailTabs': {
            beforerender: 'onBeforeTabsRender'
        },
        'people-details-progress': {
            personloaded: 'onPersonLoaded'
        },
        'people-details-progress #classesSelector menucheckitem': {
            checkchange: 'onProgressClassesChange'
        },
        termSelector: {
            change: 'onProgressTermChange'
        },
        'people-details-progress button[action=launch-browser]': {
            click: 'onListLaunchBrowserClick'
        },
        'people-details-progress #progressReportsList': {
            itemclick: 'onProgressRecordClick'
        },
        'people-details-progress-previewer button[action=launch-browser]': {
            click: 'onPreviewerLaunchBrowserClick'
        },
        'people-details-progress button[action=export-reports]': {
            click: 'onExportProgressClick'
        },
        'people-details-progress button[action=composeNote]': {
            click: 'onComposeProgressNoteClick'
        },
        'people-details-progress-note-recipientgrid #customRecipientPersonCombo': {
            select: 'onCustomRecipientPersonSelect'
        },
        'people-details-progress-note-recipientgrid button[action=addRecepient]': {
            click: 'onAddProgressNoteRecipient'
        },
        'people-details-progress-note-editwindow button[action=discardProgressNote]': {
            click: 'onDiscardProgressNote'
        },
        'people-details-progress-note-editwindow button[action=sendProgressNote]': {
            click: 'onSendProgressNote'
        }
    },

    init: function () {
        this.bufferedDoFilter = Ext.Function.createBuffered(this.doFilter, 1000, this);
    },

    // event handlers
    onBeforeTabsRender: function (detailTabs) {
        detailTabs.add(this.getProgressPanel());
    },

    onPersonLoaded: function (progressPanel, person) {
        var me = this,
            progressProxy = me.getPeopleProgressReportsStore().getProxy();

        progressProxy.setExtraParam('student', person.get('Username') || person.getId());
        progressProxy.setExtraParam('classes[]', Ext.Array.map(me.getClassesSelector().query('menucheckitem'), function(checkItem) {
            return checkItem.getValue();
        }));
        progressProxy.setExtraParam('term', me.getTermSelector().getValue() || '');

        me.doFilter(true);
    },

    onComposeProgressNoteClick: function () {
        var me = this,
            editor = me.getProgressNoteEditorWindow(),
            store = me.getPeopleProgressNoteRecipientsStore(),
            person = me.getPeopleManager().getSelectedPerson(),
            personId = person.getId(),
            phantomRecord = new (me.getPersonProgressProgressNoteModel())({
                ContextClass: 'Emergence\\People\\Person',
                ContextID: personId
            });

        editor.setProgressNote(phantomRecord);

        editor.show();

        store.load({
            params: {
                personID: personId
            },
            callback: function () {
                var advisorRecipient = store.findExact('PersonID', person.get('AdvisorID'));

                if (advisorRecipient !== -1) {
                    me.getProgressNoteRecipientGrid().getSelectionModel().select(advisorRecipient);
                }
            }
        });
    },

    onCustomRecipientPersonSelect: function (combo, record) {
        combo.nextSibling('textfield[name=Email]').setValue(record.get('Email'));
    },

    onAddProgressNoteRecipient: function (btn) {
        var me = this,
            menu = btn.up('menu'),
            personField = menu.down('combo[name="Person"]'),
            emailField = menu.down('textfield[name="Email"]'),
            relationshipField = menu.down('textfield[name="Label"]'),
            person = me.getPeopleManager().getSelectedPerson(),
            values = {
                Person: personField.getValue(),
                Label: relationshipField.getValue(),
                Email: emailField.getValue(),
                StudentID: person.getId()
            },
            recipientGrid = me.getProgressNoteRecipientGrid(),
            recipientsStore = me.getPeopleProgressNoteRecipientsStore();


        if (personField.isValid() && emailField.isValid()) {
            recipientGrid.setLoading('Attempting to add custom recipient &hellip;');

            SlateAdmin.API.request({
                url: '/notes/addCustomRecipient',
                params: values,
                success: function (res) {
                    var r = Ext.decode(res.responseText),
                        record;

                    if (r.success) {
                        record = recipientsStore.add(r.data);

                        recipientsStore.sort({
                            sorterFn: function (p1, p2) {
                                if (p1.get('RelationshipGroup') != 'Other' && p2.get('RelationshipGroup') != 'Other') {
                                    return 0;
                                }

                                if (p1.get('RelationshipGroup') != 'Other') {
                                    return 1;
                                }

                                if (p2.get('RelationshipGroup') != 'Other') {
                                    return -1;
                                }

                                return -1;
                            }
                        });

                        recipientGrid.getSelectionModel().select(record, true);

                        menu.hide();
                        personField.reset();
                        emailField.reset();
                        relationshipField.reset();
                    } else {
                        Ext.Msg.alert('Failure adding recipient', r.message);
                    }

                    recipientGrid.setLoading(false);
                },
                failure: function () {
                    recipientGrid.setLoading(false);
                }
            });
        }
    },

    onDiscardProgressNote: function () {
        Ext.Msg.confirm('Discarding Progress Note', 'Are you sure you want to discard this progress note?', function(btn) {
            if (btn == 'yes') {
                this.getProgressNoteEditorWindow().close();
            }
        }, this);
    },

    onSendProgressNote: function() {
        var me = this,
            recipients = me.getProgressNoteRecipientGrid().getSelectionModel().getSelection();

        if (recipients.length) {
            Ext.Msg.confirm('Sending', 'Are you sure you want to send this message?', function (btn) {
                if (btn == 'yes') {
                    me.doSaveProgressNote(me.getProgressNoteEditorWindow().syncProgressNote(), recipients);
                }
            });
        } else {
            Ext.Msg.alert('Cannot send email', 'Please select recipients before sending.');
        }

    },

    onProgressClassesChange: function () {
        this.getPeopleProgressReportsStore().getProxy().setExtraParam(
            'classes[]',
            Ext.Array.map(this.getClassesSelector().query('menucheckitem[checked]'), function(checkItem) {
                return checkItem.getValue();
            })
        );

        this.bufferedDoFilter();
    },

    onProgressTermChange: function (field, newValue) {
        var reportsStore = this.getPeopleProgressReportsStore(),
            reportsProxy = reportsStore.getProxy();

        reportsProxy.setExtraParam('term', newValue);

        this.bufferedDoFilter();
    },

    onExportProgressClick: function () {
        var reportsPanel = this.getProgressPanel(),
            params = Ext.apply(
                {
                    format: 'pdf'
                },
                this.getPeopleProgressReportsStore().getProxy().getExtraParams()
            );

        Ext.Msg.confirm('Exporting Reports', 'Are you sure want to export the currently loaded reports', function(btn) {
            if (btn != 'yes') {
                return;
            }

            reportsPanel.setLoading({
                msg: 'Preparing PDF, please wait, this may take a minute&hellip;'
            });

            SlateAdmin.API.downloadFile('/progress?' + Ext.Object.toQueryString(params), function () {
                reportsPanel.setLoading(false);
            });
        });
    },

    onListLaunchBrowserClick: function() {
        var params = this.getPeopleProgressReportsStore().getProxy().getExtraParams();

        window.open(SlateAdmin.API.buildUrl('/progress?' + Ext.Object.toQueryString(params)));
    },

    onProgressRecordClick: function (view, record) {
        var me = this;

        switch (record.get('Class')) {
            case 'Slate\\Progress\\Note':
                me.onProgressNoteClick(record);
                break;

            case 'Slate\\Progress\\SectionTermReport':
                me.onTermReportClick(record);
                break;

            case 'Slate\\Progress\\SectionInterimReport':
                me.onInterimReportClick(record);
                break;

            default:
                break;
        }
    },

    onPreviewerLaunchBrowserClick: function() {
        window.open(this.getReportPreviewer().getUrl());
    },

    onProgressNoteClick: function (progressRecord) {
        var me = this,
            editor = me.getProgressNoteEditorWindow(),
            recipientsStore = me.getPeopleProgressNoteRecipientsStore();

        me.getNoteEditorCt().getLayout().setActiveItem(me.getProgressNoteViewer());
        recipientsStore.removeAll();
        editor.setProgressNote(null);

        editor.show();
        editor.setLoading({
            msg: 'Loading progress note&hellip;'
        });

        me.getPersonProgressProgressNoteModel().load(progressRecord.get('ID'), {
            success: function(noteRecord) {
                editor.setProgressNote(noteRecord);
                editor.setLoading(false);
            }
        });

        recipientsStore.load({
            params: {
                messageID: progressRecord.get('ID')
            },
            callback: function (records) {
                me.getProgressNoteRecipientGrid().getSelectionModel().select(Ext.Array.filter(records, function(record) {
                    return record.get('selected');
                }));
            }
        });
    },

    onTermReportClick: function (record) {
        var reportPreviewer = this.getReportPreviewer();

        reportPreviewer.show();
        reportPreviewer.setReport(record);
    },

    onInterimReportClick: function (record) {
        var reportPreviewer = this.getReportPreviewer();

        reportPreviewer.show();
        reportPreviewer.setReport(record);
    },

    doFilter: function (forceReload, callback) {
        var store = this.getPeopleProgressReportsStore(),
            proxy = store.getProxy();

        if (forceReload || proxy.isExtraParamsDirty()) {
            store.load({
                callback: callback,
                scope: this
            });
        }
    },

    doSaveProgressNote: function (record, recipients) {
        var me = this,
            editorWindow = me.getProgressNoteEditorWindow(),
            reportsProxy = me.getPeopleProgressReportsStore().getProxy(),
            includeFields = reportsProxy.getInclude();

        editorWindow.setLoading('Sending&hellip;');

        if (record.phantom) {
            record.save({
                params: {
                    summary: reportsProxy.getSummary(),
                    include: Ext.isArray(includeFields) ? includeFields.join(',') : includeFields
                },
                success: function (savedRecord) {
                    me.getPeopleProgressReportsStore().insert(0, savedRecord);
                    me.doSaveRecipients(savedRecord, recipients);
                },
                failure: function(failedRecord, operation) {
                    editorWindow.setLoading(false);
                    Ext.Msg.alert('Failed to save note', operation.getError() || 'An unknown problem occurred, please try again later or contact support');
                }
            });
        } else {
            me.doSaveRecipients(record, recipients);
        }
    },

    doSaveRecipients: function (record, recipients) {
        var me = this,
            editorWindow = me.getProgressNoteEditorWindow();

        SlateAdmin.API.request({
            url: '/notes/' + record.get('ID') + '/recipients',
            method: 'POST',
            jsonData: {
                data: recipients.map(function(r) {
                    return {
                        PersonID: r.get('PersonID'),
                        Email: r.get('Email')
                    };
                })
            },
            success: function (response) {
                editorWindow.setLoading(false);

                if (response.data.success) {
                    editorWindow.hide();
                } else {
                    Ext.Msg.alert('Failed to add recipients to saved note', response.data.error || 'An unknown problem occurred, please try again later or contact support');
                }
            },
            failure: function() {
                editorWindow.setLoading(false);
                Ext.Msg.alert('Failed to add recipients to saved note', 'An unknown problem occurred, please try again later or contact support');
            }
        });
    }
});