/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.controller.progress.Standards', {
    extend: 'Ext.app.Controller',

    views: [
        'progress.standards.assignments.Manager',
        'progress.standards.Printer',
        'progress.standards.assignments.StudentsGrid'
    ],


    stores: [
        'progress.standards.WorksheetAssignments',
        'progress.standards.WorksheetStudents',
        'progress.standards.People',
        'people.Advisors'
    ],

    refs: {
        standardsPanel: 'progress-standards-printer',
        standardsPrintForm: 'progress-standards-printer form',
        studentEditor: 'progress-standards-assignments-studenteditor',
        studentsGrid: 'progress-standards-assignments-studentsgrid',
        standardsWorksheetForm: 'progress-standards-assignments-worksheetform',
        assignmentGrid: 'progress-standards-assignments-grid',
        standardsManager: {
            selector: 'progress-standards-assignments-manager',
            autoCreate: true,

            xtype: 'progress-standards-assignments-manager'
        },
        standardsPrinter: {
            selector: 'progress-standards-printer',
            autoCreate: true,

            xtype: 'progress-standards-printer'
        },
        standardsTermSelector: 'progress-standards-assignments-grid #termSelector',
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
        'progress-standards-assignments-manager': {
            activate: 'onStandardsActivate'
        },
        'progress-standards-printer': {
            activate: 'onPrinterActivate'
        },
        'progress-standards-printer button[action=clear-filters]': {
            click: 'onStandardsClearFiltersClick'
        },
        'progress-standards-printer button[action=preview]': {
            click: 'onStandardsPreviewClick'
        },
        'progress-standards-printer button[action=print]': {
            click: 'onStandardsPrintClick'
        },
        'progress-standards-assignments-grid button[action=myClassesToggle]': {
            toggle: 'onMyClassesToggle'
        },
        'progress-standards-assignments-studenteditor textareafield': {
            change: {
                fn: 'onDescriptionChange',
                buffer: 2000
            },
            keydown: 'onDirtyDescription',
            specialkey: 'onDirtyDescription'
        },
        'progress-standards-assignments-grid': {
            select: 'loadSection',
            edit: 'onStandardsAssignmentEdit'
        },
        'progress-standards-assignments-studentsgrid': {
            select: 'loadWorksheet'
        },
        'progress-standards-assignments-worksheetform combo': {
            change: 'onComboValueChange'
        },
        'progress-standards-assignments-worksheetform button[action=saveWorksheetForm]': {
            click: 'saveWorksheetForm'
        },
        'progress-standards-assignments-grid #termSelector': {
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

        Ext.getStore('progress.standards.WorksheetStudents').removeAll(true);
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
        var store = Ext.getStore('progress.standards.WorksheetAssignments');

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

        Ext.getStore('progress.standards.WorksheetAssignments').load({
            url: '/standards/' + (btn.pressed ? 'my-sections' : 'term-sections'),
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

        Ext.getStore('progress.standards.WorksheetAssignments').load({
            url: '/standards/json/' + (pressed ? 'my-sections': 'term-sections'),
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
            termID = termSelector.getValue(),
            termSelector = me.getStandardsTermSelector();

        me.loadedStudent = record;

        manager.updateStudent(record);

        worksheetForm.enable();

        worksheetForm.setLoading(true);

        Ext.Ajax.request({
            url: '/standards/json/student-worksheet',
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
            worksheetStore = Ext.getStore('progress.standards.WorksheetAssignments');

        if(!term && reportingTerm) {
            term = reportingTerm.getId();
            termSelector.setValue(term);
        }

        worksheetStore.load({
            url: '/standards/my-sections',
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
            termID = termSelector.getValue(),
            termSelector = me.getStandardsTermSelector();

        manager.updateSection(record);

        me.loadedSection = record;

        editor.setTitle(record.get('CourseSection').Title);

        editor.loadRecord(record);
        editor.enable();
        grid.setSection(record);

        Ext.getStore('progress.standards.WorksheetStudents').load({
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
                combo.up('progress-standards-assignments-worksheetform').down('button[action=saveWorksheetForm]').focus();
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
            url: '/standards/student-worksheet',
            params: {
                courseSectionID: section.get('CourseSectionID'),
                termID: termID,
                studentID: student.get('ID')
            },
            success: function (form, action) {

                var studentGrid = me.getStudentsGrid(),
                    studentSelModel = studentGrid.getSelectionModel(),
                    worksheetsStore = Ext.getStore('progress.standards.WorksheetStudents');

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
