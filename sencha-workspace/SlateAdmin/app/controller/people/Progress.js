/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate, Jarvus*/
Ext.define('SlateAdmin.controller.people.Progress', {
    extend: 'Ext.app.Controller',

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
        progressPanel: {
            selector: 'people-details-progress',
            autoCreate: true,

            xtype: 'people-details-progress'
        },
        progressList: 'people-details-progress dataview',
        peopleManager: 'people-manager',
        classesSelector: 'people-details-progress #classesSelector',
        termSelector: 'people-details-progress #termSelector',
        reportPreviewer: {
            selector: 'people-details-progress-previewer',
            autoCreate: true,

            xtype: 'people-details-progress-previewer'
        },
        noteEditorCt: 'people-details-progress-note-editwindow #progressNoteCt',
        progressNoteForm: 'people-details-progress-note-form',
        progressNoteViewer: 'people-details-progress-note-viewer',
        progressNoteRecipientGrid: 'people-details-progress-note-recipientgrid',
        progressNoteEditorWindow: {
            selector: 'people-details-progress-note-editwindow',
            autoCreate: true,

            xtype: 'people-details-progress-note-editwindow'
        }
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
        'people-details-progress #progressReportsList': {
            itemclick: 'onProgressRecordClick'
        },
        'people-details-progress button[action=export-reports]':{
            click: 'onExportProgressClick'
        },
        'people-details-progress button[action=composeNote]':{
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
            progressProxy = Ext.getStore('people.ProgressReports').getProxy();

        progressProxy.setExtraParam('student', person.getId());
        progressProxy.setExtraParam('classes[]', Ext.Array.map(me.getClassesSelector().query('menucheckitem'), function(checkItem) {
            return checkItem.getValue();
        }));
        progressProxy.setExtraParam('term', me.getTermSelector().getValue() || 0);

        me.doFilter(true);
    },

    onComposeProgressNoteClick: function () {
        var me = this,
            editor = me.getProgressNoteEditorWindow(),
            noteEditorCt = me.getNoteEditorCt(),
            form = me.getProgressNoteForm(),
            store = Ext.getStore('people.progress.NoteRecipients'),
            person = me.getPeopleManager().getSelectedPerson(),
            personId = person.getId(),
            phantomRecord = new(me.getModel('person.progress.ProgressNote'))({
                ContextClass: 'Emergence\\People\\Person',
                ContextID: personId
            });

        noteEditorCt.getLayout().setActiveItem(form);

        editor.updateProgressNote(phantomRecord);

        editor.show();

        store.load({
            params: {
                personID: personId
            },
            callback: function () {

                var noteRecipientID = store.findBy(function (record) {
                    if(record.get('PersonID') == person.get('AdvisorID') ) {
                        return true;
                    }
                });
                if (noteRecipientID !== -1) {
                    me.getProgressNoteRecipientGrid().selModel.select(noteRecipientID);
                }

            }
        });
    },

    onCustomRecipientPersonSelect: function (combo, record) {
        var emailField = combo.nextSibling('textfield[name="Email"]'),
            email = record.get('PrimaryEmail');
        if (email) {
            emailField.setValue(records[0].get('PrimaryEmail').Data);
        }
    },

    onAddProgressNoteRecipient: function (btn, t) {
        var menu = btn.up('menu'),
            personField = menu.down('combo[name="Person"]'),
            emailField = menu.down('textfield[name="Email"]'),
            relationshipField = menu.down('textfield[name="Label"]'),
            person = this.getPeopleManager().getSelectedPerson(),
            values = {
                Person: personField.getValue(),
                Label: relationshipField.getValue(),
                Email: emailField.getValue(),
                StudentID: person.getId()
            },
            recipientGrid = this.getProgressNoteRecipientGrid(),
            recipientsStore = Ext.getStore('people.progress.NoteRecipients');


        if (personField.isValid() && emailField.isValid()) {
            recipientGrid.setLoading('Attempting to add custom recipient &hellip;');

            SlateAdmin.API.request({
                url: '/notes/addCustomRecipient',
                params: values,
                success: function (res) {
                    var r = Ext.decode(res.responseText);

                    if (!r.success) {
                        Ext.Msg.alert('Failure adding recipient', r.message);
                    } else {
                        var record = recipientsStore.add(r.data);

                        recipientsStore.sort({
                            sorterFn: function (p1, p2){
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

    onSendProgressNote: function (){
        var me = this,
            editorWindow = me.getProgressNoteEditorWindow(),
            recipients = me.getProgressNoteRecipientGrid().getSelectionModel().getSelection(),
            record = editorWindow.getProgressNote();

        if (!recipients.length) {
            return Ext.Msg.alert('Cannot send email', 'Please select recipients before sending.');
        }

        editorWindow.setLoading('Sending&hellip;');

        Ext.Msg.confirm('Sending', 'Are you sure you want to send this message?', function(btn) {
            if (btn=='no') {
                editorWindow.setLoading(false);
                return false;
            }


            me.doSaveProgressNote(record, recipients);
        });
    },

    onProgressClassesChange: function () {
        Ext.getStore('people.ProgressReports').getProxy().setExtraParam(
            'classes[]',
            Ext.Array.map(this.getClassesSelector().query('menucheckitem[checked]'), function(checkItem) {
                return checkItem.getValue();
            })
        );

        this.bufferedDoFilter();
    },

    onProgressTermChange: function (field, newValue, oldValue) {
        var reportsStore = Ext.getStore('people.ProgressReports'),
            reportsProxy = reportsStore.getProxy();

        reportsProxy.setExtraParam('term', newValue);

        this.bufferedDoFilter();
    },

    onExportProgressClick: function () {
        var me = this,
            reportsStore = Ext.getStore('people.ProgressReports'),
            reportsProxy = reportsStore.getProxy(),
            reportsContainer = me.getProgressPanel(),
            apiHost = SlateAdmin.API.getHost(),
            exportUrl = '/progress?' + Ext.Object.toQueryString(Ext.apply({ format: 'pdf' }, reportsProxy.getExtraParams())),
            exportLoadMask = {msg: 'Preparing PDF, please wait, this may take a minute&hellip;' };

        Ext.Msg.confirm('Exporting Reports', 'Are you sure want to export the currently loaded reports', function(btn) {
            if (btn == 'yes') {
                if (Ext.isEmpty(apiHost)) {
                    reportsContainer.setLoading(exportLoadMask);
                }

                SlateAdmin.API.downloadFile(exportUrl, function () {
                    reportsContainer.setLoading(false);
                }, me);
            }
        }, me);
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
        }
    },

    onProgressNoteClick: function (record) {
        var me = this,
            editor = me.getProgressNoteEditorWindow(),
            noteEditorCt = me.getNoteEditorCt(),
            viewer = me.getProgressNoteViewer(),
            progressContainer = me.getProgressPanel();

        progressContainer.setLoading({msg: 'Setting up progress note'});

        noteEditorCt.getLayout().setActiveItem(viewer);
        SlateAdmin.API.request({
            url: '/notes/' + record.get('ID'),
            success: function (res) {
                var r = Ext.decode(res.responseText);
                editor.updateProgressNote(r.data);
                progressContainer.setLoading(false);
            }
        });

        Ext.getStore('people.progress.NoteRecipients').load({
            params: {
                messageID: record.get('ID')
            },
            callback: function (records, operation){
                var selected = [];
                this.sort({
                    sorterFn: function (p1, p2){
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


                for (var key in records) {
                    if (records[key].get('selected')) {
                        selected.push(records[key]);
                    }
                }

                me.getProgressNoteRecipientGrid().getSelectionModel().select(selected);
            }
        });
        editor.show();
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
        var store = Ext.getStore('people.ProgressReports'),
            proxy = store.getProxy();

        if (forceReload || proxy.isExtraParamsDirty()) {
            store.load({
                callback: callback,
                scope: this
            });
        }
    },

    doSaveProgressNote: function (record, recipients){
        var me = this;

        if (record.phantom) {
            record.save({
                success: function (savedRecord) {
                    Ext.getStore('people.ProgressReports').insert(0, {
                        ID: savedRecord.get('ID'),
                        AuthorUsername: savedRecord.get('Author').Username,
                        Date: Ext.Date.format(new Date(savedRecord.get('Created') * 1000),'Y-m-d H:i:s'),
                        Subject: savedRecord.get('Subject')

                    });
                    me.doSaveRecipients(record, recipients, true);
                },
                failure: me.onProgressSaveFailure,
                scope: me
            });
        } else {
            me.doSaveRecipients(record, recipients, false);
        }
    },

    doSaveRecipients: function (record, recipients, isPhantomNote) {
        var me = this,
            editorWindow = me.getProgressNoteEditorWindow(),
            noteId = '';

        if (record.get) {
            noteId = record.get('ID');
        } else {
            noteId = record.ID;
        }

        SlateAdmin.API.request({
            url: '/notes/' + noteId + '/recipients',
            method: 'POST',
            jsonData: {
                data: recipients.map(function (r) {
                    return  {
                        PersonID: r.get('PersonID'),
                        Email: r.get('Email')
                    };
                }),
                messageID: noteId
            },
            success: function (res) {
                var r = Ext.decode(res.responseText);

                if (r.success) {
                    editorWindow.setLoading(false);
                    editorWindow.hide();
                } else {
                    me.onProgressSaveFailure();
                }
            },
            failure: me.onProgressSaveFailure
        });
    }
});