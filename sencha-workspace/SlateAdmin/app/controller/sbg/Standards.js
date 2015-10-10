/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.controller.sbg.Standards', {
    extend: 'Ext.app.Controller',

    views: [
        'sbg.standards.assignments.Manager',
        'sbg.standards.Printer',
        'sbg.standards.assignments.StudentsGrid'
    ],


    stores: [
        'sbg.standards.WorksheetAssignments',
        'sbg.standards.WorksheetStudents',
        'sbg.standards.People',
        'people.Advisors'
    ],

    refs: {
        standardsPanel: 'sbg-standards-printer',
        standardsPrintForm: 'sbg-standards-printer form',
        studentEditor: 'sbg-standards-assignments-studenteditor',
        studentsGrid: 'sbg-standards-assignments-studentsgrid',
        standardsWorksheetForm: 'sbg-standards-assignments-worksheetform',
        assignmentGrid: 'sbg-standards-assignments-grid',
        standardsManager: {
            selector: 'sbg-standards-assignments-manager',
            autoCreate: true,

            xtype: 'sbg-standards-assignments-manager'
        },
        standardsPrinter: {
            selector: 'sbg-standards-printer',
            autoCreate: true,

            xtype: 'sbg-standards-printer'
        },
        standardsTermSelector: 'sbg-standards-assignments-grid #termSelector',
        navPanel: {
            selector: 'progress-navpanel',
            autoCreate: true,

            xtype: 'progress-navpanel'
        }
    },


    routes: {
        'progress/standards': 'showStandards',
        'progress/standards/printing': 'showStandardsPrinting'
    },

    control: {
        'sbg-standards-assignments-manager': {
            activate: 'onStandardsActivate'
        },
        'sbg-standards-printer': {
            activate: 'onPrinterActivate'
        },
        'sbg-standards-printer button[action=clear-filters]': {
            click: 'onStandardsClearFiltersClick'
        },
        'sbg-standards-printer button[action=preview]': {
            click: 'onStandardsPreviewClick'
        },
        'sbg-standards-printer button[action=print]': {
            click: 'onStandardsPrintClick'
        },
        'sbg-standards-assignments-grid button[action=myClassesToggle]': {
            toggle: 'onMyClassesToggle'
        },
        'sbg-standards-assignments-studenteditor textareafield': {
            change: {
                fn: 'onDescriptionChange',
                buffer: 2000
            },
            keydown: 'onDirtyDescription',
            specialkey: 'onDirtyDescription'
        },
        'sbg-standards-assignments-grid': {
            select: 'loadSection',
            edit: 'onStandardsAssignmentEdit'
        },
        'sbg-standards-assignments-studentsgrid': {
            select: 'loadWorksheet'
        },
        'sbg-standards-assignments-worksheetform combo': {
            change: 'onComboValueChange'
        },
        'sbg-standards-assignments-worksheetform button[action=saveWorksheetForm]': {
            click: 'saveWorksheetForm'
        },
        'sbg-standards-assignments-grid #termSelector': {
            change: 'onTermChange'
        }
    },

    //route handlers
    showStandards: function () {
        var me = this,
            navPanel = me.getNavPanel();

        navPanel.expand();
        navPanel.setActiveLink('progress/standards');
        me.application.getController('Viewport').loadCard(me.getStandardsManager());
    },

    showStandardsPrinting: function () {
        this.application.getController('Viewport').loadCard(this.getStandardsPrinter());
    },


    //event handlers
    onStandardsActivate: function () {
        var me = this,
            termStore = Ext.getStore('Terms');

        Ext.getStore('sbg.standards.WorksheetStudents').removeAll(true);
        me.loadedSection = false;

        if (!termStore.isLoaded()) {
            termStore.load({
                callback: function () {
                    me.loadWorksheets();
                }
            });
        } else {
            me.loadWorksheets();
        }
    },

    onPrinterActivate: function (manager) {
        var termSelector = this.getStandardsPrinter().down('combo[name=termID]'),
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

    onDirtyDescription: function (field) {
        field.addClass('dirty').removeCls('saved');
    },

    onStandardsAssignmentEdit: function (editor, e) {
        var store = Ext.getStore('sbg.standards.WorksheetAssignments');

        if (e.field == 'WorksheetID' && e.orignalValue != e.value && !e.originalValue) {
            store.on('write', this.onStandardWorksheetAssignmentWrite, this, {
                single: true
            });
        }
    },

    onStandardWorksheetAssignmentWrite: function (store, operation) {
        var assignmentGrid = this.getAssignmentGrid(),
            selModel = assignmentGrid.getSelectionModel();

        selModel.deselectAll();
        selModel.select(operation.records[0]);
    },

    onTermChange: function (field, newValue, oldValue) {
        var grid = this.getAssignmentGrid(),
            btn = grid.down('button[action=myClassesToggle]');

        Ext.getStore('sbg.standards.WorksheetAssignments').load({
            url: '/sbg/standards/' + (btn.pressed ? 'my-sections' : 'term-sections'),
            params: {
                termID: newValue
            }
        });
    },

    onStandardsClearFiltersClick: function () {
        this.getStandardsPrintForm().getForm().reset();
    },

    onDescriptionChange: function (field, newValue, oldValue) {
        var me = this;

        if (me.loadedSection) {
            field.removeCls('dirty').addCls('saved');
            if (me.getStudentEditor()) {
                me.getStudentEditor().getForm().getRecord().set('Description', newValue);
            }
        }
    },

    onMyClassesToggle: function (btn, pressed) {
        var termSelector = this.getStandardsTermSelector(),
            termID = termSelector.getValue();

        Ext.getStore('sbg.standards.WorksheetAssignments').load({
            url: '/sbg/standards/' + (pressed ? 'my-sections': 'term-sections'),
            params: {
                termID: termID
            }
        });
    },

    onStandardsPreviewClick: function () {
        var formValues = this.getStandardsPrintForm().getForm().getValues(),
            advisorsStore = Ext.getStore('people.Advisors');

        if (!advisorsStore.isLoaded()) {
            advisorsStore.load();
        }
        this.getStandardsPanel().loadPreview(formValues);
    },

    onStandardsPrintClick: function () {
        var formValues = this.getStandardsPrintForm().getForm().getValues();
        this.getStandardsPanel().loadPrint(formValues);
    },


    //helper functions
    loadWorksheet: function (view, record) {
        var me = this,
            worksheetForm = me.getStandardsWorksheetForm(),
            manager = me.getStandardsManager(),
            termSelector = me.getStandardsTermSelector(),
            termID = termSelector.getValue();

        me.loadedStudent = record;

        manager.setStudent(record);

        worksheetForm.enable();

        worksheetForm.setLoading(true);

        SlateAdmin.API.request({
            url: '/sbg/standards/student-worksheet',
            method: 'GET',
            params: {
                courseSectionID: manager.getSection().get('CourseSectionID'),
                termID: termID,
                studentID: manager.getStudent().get('ID')
            },
            success: function (response) {
                var r = Ext.decode(response.responseText);

                if (!r.success || !r.data) {
                    return Ext.MessageBox.alert('Can\'t find prompts', 'You have to go add prompts onto this worksheet before you can grade your students');
                }

                Ext.each(r.data, function (grade) {
                    worksheetForm.add(me.configurePromptField(grade));
                });

                worksheetForm.doLayout();
                worksheetForm.setLoading(false);
                //focus first field
                worksheetForm.down('combobox').focus();
            }
        });
    },

    configurePromptField: function (grade) {
        return {
            xtype: 'container',
            cls: 'label-component-ct',
            padding: '4 8',
            layout: 'hbox',
            items: [{
                xtype: 'combobox',
                cls: 'field-component-labeled',
                store: ['1', '2', '3', '4', 'N/A'],
                queryMode: 'local',
                name: 'prompt-' + grade.PromptID,
                value: grade.Grade || null
            },{
                xtype: 'component',
                cls: 'field-label-component',
                html: grade.PromptTitle,
                flex: 1,
                padding: '4 8',
                listeners: {
                    render: function (labelCmp) {
                        labelCmp.mon(labelCmp.getEl(), 'click', function (ev, t) {
                            var fieldCmp = labelCmp.prev('combobox');

                            if (fieldCmp) {
                                fieldCmp.focus();
                            }
                        });
                    }
                }
            }]
        };
    },

    loadWorksheets: function() {
         var termSelector = this.getStandardsTermSelector(),
            termStore = Ext.getStore('Terms'),
            term = termSelector.getValue(),
            reportingTerm = termStore.getReportingTerm(),
            worksheetStore = Ext.getStore('sbg.standards.WorksheetAssignments');

        if(!term && reportingTerm) {
            term = reportingTerm.getId();
            termSelector.setValue(term);
        }

        worksheetStore.load({
            url: '/sbg/standards/my-sections',
            params: {
                termID: term
            }
        });
    },

    loadSection: function (view, record) {
        if (!record.get("WorksheetID")) {
            return false;
        }

        if (!record.get('Worksheet')) {
            return false;
        }

        var me = this,
            manager = me.getStandardsManager(),
            editor = me.getStudentEditor(),
            grid = me.getStudentsGrid(),
            termSelector = me.getStandardsTermSelector(),
            termID = termSelector.getValue();

        manager.setSection(record);

        me.loadedSection = record;

        editor.setTitle(record.get('CourseSection').Title);

        editor.loadRecord(record);
        editor.enable();
        grid.setSection(record);

        Ext.getStore('sbg.standards.WorksheetStudents').load({
            params: {
                courseSectionID: record.get('CourseSectionID'),
                termID: termID
            }
        });
    },

    onComboValueChange: function (combo, newValue) {
        var nextCombo;

        if (combo.findRecordByValue(newValue)) {
            nextCombo = combo.nextNode('combo');
            combo.triggerBlur();

            if (nextCombo) {
                nextCombo.focus();
            } else {
                combo.up('sbg-standards-assignments-worksheetform').down('button[action=saveWorksheetForm]').focus();
            }
        }
    },

    saveWorksheetForm: function (btn, evt) {
        var me = this,
            worksheetForm = me.getStandardsWorksheetForm(),
            manager = me.getStandardsManager(),
            section = manager.getSection(),
            student = manager.getStudent(),
            termID = termSelector.getValue(),
            termSelector = me.getStandardsTermSelector();


        worksheetForm.setLoading(true);
        worksheetForm.getForm().submit({
            url: '/sbg/standards/student-worksheet',
            params: {
                courseSectionID: section.get('CourseSectionID'),
                termID: termID,
                studentID: student.get('ID')
            },
            success: function (form, action) {

                var studentGrid = me.getStudentsGrid(),
                    studentSelModel = studentGrid.getSelectionModel(),
                    worksheetsStore = Ext.getStore('sbg.standards.WorksheetStudents');

                if (!action.result.success) {
                    Ext.Msg.alert('Save failed', 'Failed to save grades, please backup your last changes and reload before continuing work');
                    return;
                }

                student.set('PromptsGraded', action.result.data.length);
                student.commit();

                worksheetForm.setLoading(false);

                if (worksheetsStore.getAt(worksheetsStore.find('ID', studentSelModel.getSelection()[0].get('ID')) + 1)) {
                    studentSelModel.select(worksheetsStore.getAt(worksheetsStore.find('ID', studentSelModel.getSelection()[0].get('ID')) + 1));
                }
            },
            failure: function (form, action) {
                worksheetForm.setLoading(false);
            }
        });
    }
});
