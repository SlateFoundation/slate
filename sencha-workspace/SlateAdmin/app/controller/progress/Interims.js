/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.controller.progress.Interims', {
    extend: 'Ext.app.Controller',

    views: [
        'progress.interims.Manager',
        'progress.interims.Printer',
        'progress.interims.email.Manager'
    ],
    stores: [
        'progress.Interims',
        'progress.interims.Emails',
        'progress.interims.People',
        'Terms'
    ],
    models: [
        'course.Section'
    ],
    refs: {
        interimsEmailManager: {
            selector: 'progress-interims-email-manager',
            autoCreate: true,

            xtype: 'progress-interims-email-manager'
        },
        interimsEmailSearchForm: {
            selector: 'progress-interims-email-manager form'
        },
        interimsEmailGrid: 'progress-interims-email-grid',
        interimsManager: {
            selector: 'progress-interims-manager',
            autoCreate: true,

            xtype: 'progress-interims-manager'
        },
        interimsGrid: 'progress-interims-grid',
        interimReport: 'progress-interims-report',
        interimDeleteBtn: 'progress-interims-report button[action=delete]',
        interimCancelBtn: 'progress-interims-report button[action=cancel]',
        interimSaveDraftBtn: 'progress-interims-report button[action=save][status=Draft]',
        interimPublishBtn: 'progress-interims-report button[action=save][status=Published]',
        interimsPrinter: {
            selector: 'progress-interims-printer',
            autoCreate: true,

            xtype: 'progress-interims-printer'
        },
        interimsPrintForm: 'progress-interims-printer form',
        interimsTermSelector: 'progress-interims-grid #termSelector'
    },
    routes: {
        'progress/interims': 'showInterims',
        'progress/interims/email': 'showInterimEmails',
        'progress/interims/printing': 'showInterimPrinting'
    },
    control: {
        'progress-interims-manager': {
            activate: 'onInterimsActivate'
        },
        'progress-interims-grid': {
            beforeselect: 'onBeforeInterimReportSelect',
            select: 'onInterimReportSelect',
            deselect: 'onInterimReportDeselect'
        },
        'progress-interims-report button[action=delete]': {
            click: 'onInterimDeleteClick'
        },
        'progress-interims-report button[action=cancel]': {
            click: 'onInterimCancelClick'
        },
        'progress-interims-report button[action=save]': {
            click: 'onInterimSaveClick'
        },
        'progress-interims-printer': {
            activate: 'onPrinterActivate'
        },
        'progress-interims-printer button[action=preview]': {
            click: 'onInterimsPreviewClick'
        },
        'progress-interims-printer button[action=print]': {
            click: 'onInterimsPrintClick'
        },
        'progress-interims-printer button[action=save-csv]': {
            click: 'onInterimsSaveCsvClick'
        },
        'progress-interims-printer button[action=clear-filters]': {
            click: 'onInterimsClearFiltersClick'
        },
        'progress-interims-email-manager button[action=interim-email-search]': {
            click: 'onInterimEmailSearchClick'
        },
        'progress-interims-email-manager button[action=clear-filters]': {
            click: 'onInterimEmailClearFiltersClick'
        },
        'progress-interims-email-grid': {
            select: 'onStudentInterimEmailSelect'
        },
        'progress-interims-email-grid button[action=interim-email-send]': {
            click: 'onInterimEmailSendClick'
        },
        'progress-interims-grid #termSelector': {
            change: 'onTermChange'
        },
        'progress-interims-report': {
            dirtychange: 'onInterimEditorDirtyChange'
        }
    },


    //route handlers
    showInterims: function () {
        this.application.getController('Viewport').loadCard(this.getInterimsManager());
    },

    showInterimEmails: function () {
        this.application.getController('Viewport').loadCard(this.getInterimsEmailManager());
    },

    showInterimPrinting: function () {
        var advisorsStore = Ext.getStore('people.Advisors');

        if (!advisorsStore.isLoaded()) {
            advisorsStore.load();
        }
        this.application.getController('Viewport').loadCard(this.getInterimsPrinter());
    },


    //event handlers
    onInterimsActivate: function (manager) {
        var me = this,
            termStore = Ext.getStore('Terms');

            // ensure terms are loaded
        if (!termStore.isLoaded()) {
            manager.setLoading('Loading terms&hellip;');
            termStore.load({
                callback: function () {
                    manager.setLoading(false);
                    me.loadMyStudents();
                }
            });
        } else {
            me.loadMyStudents();
        }
    },

    onPrinterActivate: function (manager) {
        var termSelector = this.getInterimsPrinter().down('combo[name=termID]'),
            selectedTerm = termSelector.getValue(),
            termStore = Ext.getStore('Terms'),
            advisorStore = Ext.getStore('people.Advisors'),
            onTermLoad = function () {
                if(!selectedTerm) {
                    termSelector.setValue(termStore.getReportingTerm().getId());
                    manager.setLoading(false);
                }


            };

        if(!termStore.isLoaded()) {
            manager.setLoading('Loading terms&hellip;');
            termStore.load({
                callback: onTermLoad
            });
        }

        if(!advisorStore.isLoaded()) {
            advisorStore.load();
        }
    },

    onTermChange: function (field, newValue, oldValue) {
        Ext.getStore('progress.Interims').load({
            params: {
                termID: newValue
            }
        });
    },

    onBeforeInterimReportSelect: function (rowModel, record) {
        var me = this,
            editor = me.getInterimReport(),
            manager = me.getInterimsManager(),
            interim = manager.getInterim(),
            interimSaved = manager.getInterimSaved(),
            isDirty = editor.isDirty();

        if (!interimSaved && interim && isDirty) {
            Ext.Msg.confirm('Unsaved Changes', 'You have unsaved changes to this report.<br/><br/>Do you want to continue without saving them?', function (btn) {
                if (btn == 'yes') {
                    manager.updateInterim(record);
                    manager.setInterimSaved(true);

                    rowModel.select([record]);
                }
            });

            return false;
        }
    },

    onInterimReportSelect: function (rowModel, record, index) {
        this.getInterimsManager().updateInterim(record);
    },

    onInterimReportDeselect: function (rowModel, record, index) {
        this.getInterimsManager().unloadInterim(record);
    },

    onInterimCancelClick: function (btn, ev) {
        Ext.Msg.confirm('Cancelin Changes', 'Are you sure you want to cancel your changes', function (btn) {
            if (btn == 'yes') {
                this.getInterimsManager().unloadInterim();
            }
        }, this);
    },

    onInterimEditorDirtyChange: function () {
        this.getInterimsManager().setInterimSaved(false);
    },

    onInterimSaveClick: function (btn, ev) {
        var me = this,
            report = me.getInterimReport(),
            grade = report.down('#courseGrade').getValue(),
            reportData = report.getValues(false, true),
            manager = me.getInterimsManager(),
            interim = manager.getInterim();

        report.setLoading('Saving&hellip;');

        reportData.Status = btn.status;
        reportData.Grade = reportData.Grade ? reportData.Grade : grade;

        if (reportData.Status == 'Published' && !reportData.Grade) {
            Ext.Msg.alert('Report Incomplete', 'You must select a grade before publishing a report.');
            report.setLoading(false);
            return false;
        }

        if (reportData.Comments == '<br>') {
            reportData.Comments = null;
        }

        interim.set(reportData);

        interim.save({
            success: function (record, operation) {
                var r = Ext.decode(operation.getResponse().responseText),
                    savedInterim = r.data[0];

                me.getInterimsManager().setInterimSaved(true);

                interim.set('Saved', savedInterim.Saved);

                interim.commit();
                report.setLoading(false);

                if (!me.getInterimsGrid().getSelectionModel().selectNext()) {
                    me.getInterimsManager().unloadInterim();
                }
            },
            failure: function () {
                report.setLoading(false);
            }
        });
    },

    onInterimDeleteClick: function () {
        var me = this,
            manager = me.getInterimsManager(),
            interim = manager.getInterim(),
            grid = me.getInterimsGrid(),
            interimStore = grid.getStore();

        if (interim.get('Status') == 'Phantom') {
            return true;
        }

        Ext.Msg.confirm('Delete report?', 'Are you sure you want to delete this interim report?', function (btn) {
            if (btn != 'yes') {
                return;
            }
            me.getInterimReport().setLoading({msg: 'Deleting&hellip;'});

            interim.destroy({
                success: function (record, operation) {
                    manager.unloadInterim();

                    var phantomRecord = interimStore.add({
                        Class: interim.get('Class'),
                        Section: interim.get('Section'),
                        Student: interim.get('Student'),
                        Term: interim.get('Term'),
                        TermID: interim.get('TermID'),
                        StudentID: interim.get('StudentID'),
                        CourseSectionID: interim.get('CourseSectionID'),
                        Status: 'Phantom'
                    });

                    interimStore.sort({
                        fn: function (r1, r2) {
                            var student1 = r1.get('Student'),
                                student2 = r2.get('Student');

                                if (student1.LastName < student2.LastName) {
                                    return -1;
                                } else {
                                    return 1;
                                }
                        }
                    });

                    grid.getSelectionModel().select(phantomRecord);

                    me.getInterimReport().setLoading(false);
                },
                failure: function () {
                    me.getInterimReport().setLoading(false);
                }
            });
        });
    },

    onInterimsPreviewClick: function () {
        var formValues = this.getInterimsPrintForm().getForm().getValues();
        this.getInterimsPrinter().loadPreview(formValues);
    },

    onInterimsPrintClick: function () {
        var formValues = this.getInterimsPrintForm().getForm().getValues();
        this.getInterimsPrinter().loadPrint(formValues);
    },

    onInterimEmailSearchClick: function () {
        var formValues = this.getInterimsEmailSearchForm().getForm().getValues(),
            recipients = formValues.Recipients,
            emailStore = Ext.getStore('progress.interims.Emails'),
            emailProxy = emailStore.getProxy();

        formValues.Recipients = Array.isArray(recipients) ? recipients.join(',') :  [recipients].join(',');

        formValues = Ext.apply({
            Recipients: null,
            termID: null,
            advisorID: null,
            authorID: null,
            studentID: null
        }, formValues);

        for (var key in formValues) {
            emailProxy.setExtraParam(key, formValues[key]);
        }

        emailStore.load({
            scope: this,
            callback: function (records) {
                this.getInterimsEmailGrid().down('#interimEmailTotalText').setText(records.length + ' Report' + (records.length == 1 ? '' : 's'));
            }
        });
    },

    onStudentInterimEmailSelect: function (grid, record) {
        var emailManager = this.getInterimsEmailManager(),
            formValues = this.getInterimsEmailSearchForm().getForm().getValues(),
            recipients = formValues.Recipients,
            key;

        formValues.Recipients = Array.isArray(recipients) ? recipients.join(',') :  [recipients].join(',');


        formValues = Ext.apply(formValues,{
            studentID: record.get('Student').ID
        });

        emailManager.loadStudentPreview(formValues);
    },

    onInterimEmailSendClick: function () {
        var emailStore = Ext.getStore('progress.interims.Emails'),
            formValues = this.getInterimsEmailSearchForm().getForm().getValues(),
            recipients = formValues.Recipients;

        if (!emailStore.getCount()) {
            return Ext.Msg.alert('User Error', 'Must load interims before sending');
        }

        formValues.Recipients = Array.isArray(recipients) ? recipients.join(',') :  [recipients].join(',');

        formValues = Ext.apply({
            sendEmails: true
        }, formValues);

        Ext.Msg.confirm('Sending Interim Emails', 'Are you sure you want to send these interims?', function (btn) {
            if (btn == 'yes') {
                Ext.Ajax.request({
                    url: '/interims/email',
                    params: formValues
                });
            }
        });
    },

    onInterimsSaveCsvClick: function () {
        var formValues = this.getInterimsPrintForm().getForm().getValues();
        this.getInterimsPrinter().downloadCsv(formValues);
    },

    onInterimsClearFiltersClick: function () {
        this.getInterimsPrintForm().getForm().reset();
    },

    onInterimEmailClearFiltersClick: function () {
        this.getInterimsEmailSearchForm().getForm().reset();
    },

    loadMyStudents: function () {
        var termSelector = this.getInterimsTermSelector(),
            termStore = Ext.getStore('Terms'),
            term = termSelector.getValue(),
            reportingTerm = termStore.getReportingTerm();

        if(!term && reportingTerm) {
           term = reportingTerm.getId();
           termSelector.setValue(term);
        }

        Ext.getStore('progress.Interims').load({
            url: '/interims/mystudents',
            params: {
                termID: term
            }
        });
    }
});