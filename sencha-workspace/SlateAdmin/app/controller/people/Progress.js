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
        'people-details-progress-note-recipientgrid': {
            beforeselect: 'onRecipientsGridBeforeSelect',
            select: 'onRecipientsGridSelect',
            deselect: 'onRecipientsGridDeselect'
        },
        'people-details-progress-note-recipientgrid #customRecipientPersonCombo': {
            change: 'onCustomRecipientPersonChange',
            blur: 'onCustomRecipientPersonBlur'
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

    onRecipientsGridBeforeSelect: function(selModel, selectedRecord) {
        var personId = selectedRecord.get('PersonID'),
            fullName = selectedRecord.get('FullName');

        if (selectedRecord.get('Email')) {
            return true;
        }

        if (this.lastRecipientWarning != personId) {
            this.lastRecipientWarning = personId;
            Ext.Msg.alert(
                'Cannot select '+fullName,
                fullName+' cannot be selected as a recipient because they do not have any email address on file. Update their contact details before adding them as a recipient.'
            );
        }

        return false;
    },

    onRecipientsGridSelect: function(selModel, selectedRecord) {
        var personId = selectedRecord.get('PersonID');

        selModel.select(
            this.getPeopleProgressNoteRecipientsStore().queryBy(function(record) {
                return record !== selectedRecord && record.get('PersonID') === personId;
            }).getRange(),
            true // true to keep existing selection
        );
    },

    onRecipientsGridDeselect: function(selModel, deselectedRecord) {
        var personId = deselectedRecord.get('PersonID');

        selModel.deselect(
            this.getPeopleProgressNoteRecipientsStore().queryBy(function(record) {
                return record !== deselectedRecord && record.get('PersonID') === personId;
            }).getRange()
        );
    },

    onCustomRecipientPersonChange: function (combo, value, oldValue) {
        var record = combo.getSelectedRecord(),
            btn = combo.nextSibling('button'),
            picker = combo.getPicker(),
            navModel = picker.getNavigationModel(),
            matchPosition;

        if (!oldValue || record || typeof oldValue == 'number') {
            combo.nextSibling('textfield[name=Email]').setValue(record ? record.get('Email') : null);
        }

        if (typeof value == 'string') {
            matchPosition = combo.getStore().findExact('FullName', value);

            if (matchPosition == -1) {
                navModel.setPosition(null);
                picker.clearHighlight();
            } else {
                navModel.setPosition(matchPosition);
            }
        }

        btn.setText(record ? 'Add known person' : 'Create new person and add');
        btn.enable();
    },

    onCustomRecipientPersonBlur: function (combo) {
        combo.checkChange();
    },

    onAddProgressNoteRecipient: function (btn) {
        var me = this,
            menu = btn.up('menu'),
            personField = menu.down('combo[name="Person"]'),
            emailField = menu.down('textfield[name="Email"]'),
            person = personField.getSelectedRecord(),
            student = me.getPeopleManager().getSelectedPerson(),
            recipientGrid = me.getProgressNoteRecipientGrid(),
            recipientsStore = me.getPeopleProgressNoteRecipientsStore(),
            recipientData = {
                Email: emailField.getValue(),
                StudentID: student.getId()
            };

        if (personField.isValid() && emailField.isValid()) {
            if (person) {
                recipientData.PersonID = person.getId();
                recipientData.FullName = person.get('FullName');
            } else {
                recipientData.FullName = personField.getValue();
            }

            recipientGrid.getSelectionModel().select(recipientsStore.add(recipientData), true);

            menu.hide();
            personField.reset();
            emailField.reset();
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

        // index by PersonID to eliminate duplicates
        recipients = Ext.Array.toValueMap(recipients, function(recipient) {
            return recipient.get('PersonID') || recipient.get('Email');
        });

        // map to recipient records
        recipients = Ext.Object.getValues(recipients).map(function(r) {
            var personId = r.get('PersonID'),
                recipientData = {
                    Email: r.get('Email')
                };

            if (personId) {
                recipientData.PersonID = personId;
            } else {
                recipientData.FullName = r.get('FullName');
            }

            return recipientData;
        });

        SlateAdmin.API.request({
            url: '/notes/' + record.get('ID') + '/recipients',
            method: 'POST',
            jsonData: {
                data: recipients
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