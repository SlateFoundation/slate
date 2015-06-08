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
    
    refs: [{
        ref: 'standardsPanel',
        selector: 'progress-standards-printer'
    }, {
        ref: 'standardsPrintForm',
        selector: 'progress-standards-printer form'
    }, {
        ref: 'studentEditor',
        selector: 'progress-standards-assignments-studentseditor'
    }, {
        ref: 'studentsGrid',
        selector: 'progress-standards-assignments-studentsgrid'
    }, {
        ref: 'standardsWorksheetForm',
        selector: 'progress-standards-assignments-worksheetform'
    }, {
        ref: 'assignmentGrid',
        selector: 'progress-standards-assignments-grid'
    }, {
        ref: 'standardsManager',
        autoCreate: true,
        selector: 'progress-standards-assignments-manager',
        xtype: 'progress-standards-assignments-manager'
    }, {
        ref: 'standardsPrinter',
        autoCreate: true,
        selector: 'progress-standards-printer',
        xtype: 'progress-standards-printer'
    }, {
        ref: 'standardsTermSelector',
        selector: 'progress-standards-assignments-grid #termSelector'
    }, {
        ref: 'navPanel',
        selector: 'progress-navpanel',
        autoCreate: true,
        
        xtype: 'progress-navpanel'
    }],
    
    
    routes: {
        'progress/standards': 'showStandards',
        'progress/standards/printing': 'showStandardsPrinting'
    },
    
    init: function () {

        var me = this;

        me.control({
            'progress-standards-assignments-manager': {
                activate: me.onStandardsActivate
            },
            'progress-standards-printer button[action=clear-filters]': {
                click: me.onStandardsClearFiltersClick
            },
            'progress-standards-printer button[action=preview]': {
                click: me.onStandardsPreviewClick
            },
            'progress-standards-printer button[action=print]': {
                click: me.onStandardsPrintClick
            },
            'progress-standards-assignments-grid button[action=myClassesToggle]': {
                toggle: me.onMyClassesToggle
            },
            'progress-standards-assignments-studentseditor textareafield': {
                change: {
                    fn: me.onDescriptionChange,
                    buffer: 2000
                },
                keydown: me.onDirtyDescription,
                specialkey: me.onDirtyDescription
            },
            'progress-standards-assignments-grid': {
                select: me.loadSection,
                edit: me.onStandardsAssignmentEdit
            },
            'progress-standards-assignments-studentsgrid': {
                select: me.loadWorksheet
            },
            'progress-standards-assignments-worksheetform combo': {
                change: me.onComboValueChange
            },
            'progress-standards-assignments-worksheetform button[action=saveWorksheetForm]': {
                click: me.saveWorksheetForm
            },
            'progress-standards-assignments-grid #termSelector': {
                change: me.onTermChange
            }
        });
    },


    //route handlers
    showStandards: function () {
        var me = this,
            navPanel = me.getNavPanel();
        
        navPanel.expand();
        navPanel.setActiveLink('progress/standards');
        me.application.loadCard(me.getStandardsManager());
    },

    showStandardsPrinting: function () {
        this.application.loadCard(this.getStandardsPrinter());
    },


    //event handlers
    onStandardsActivate: function () {
        var termSelector = this.getStandardsTermSelector(),
            worksheetStore = Ext.getStore('progress.standards.WorksheetAssignments');

        Ext.getStore('progress.standards.WorksheetStudents').removeAll(true);
        this.loadedSection = false;

        worksheetStore.load({
            url: '/standards/my-sections',
            params: {
                termID: termSelector ? termSelector.getValue() : window.currentTerm,
                format: 'json'
            }
        });
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
                termID: newValue,
                format: 'json'
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
        var termSelector = this.getStandardsTermSelector();
        Ext.getStore('progress.standards.WorksheetAssignments').load({
            url: '/standards/json/' + (pressed ? 'my-sections': 'term-sections'),
            params: {
                termID: termSelector ? termSelector.getValue() : window.currentTerm
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
                termID: termSelector ? termSelector.getValue() : window.currentTerm,
                studentID: manager.getStudent().get('ID')
            },
            success: function (response) {
                var r = Ext.decode(response.responseText);

                if (!r.success || !r.data)
                    return Ext.MessageBox.alert('Can\'t find prompts', 'You have to go add prompts onto this worksheet before you can grade your students');

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
            items: [
                {
                    xtype: 'combobox',
                    cls: 'field-component-labeled',
                    store: ['1', '2', '3', '4', 'N/A'],
                    queryMode: 'local',
                    name: 'prompt-' + grade.PromptID,
                    value: grade.Grade || null
                },
                {
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
                }
            ]
        };
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
                termID: termSelector ? termSelector.getValue() : window.currentTerm
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
            termSelector = me.getStandardsTermSelector();


        worksheetForm.setLoading(true);
        worksheetForm.getForm().submit({
            url: '/standards/student-worksheet',
            params: {
                courseSectionID: section.get('CourseSectionID'),
                termID: termSelector ? termSelector.getValue() : window.currentTerm,
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

                if (worksheetsStore.getAt(worksheetsStore.find('ID', studentSelModel.getSelection()[0].get('ID')) + 1))
                    studentSelModel.select(worksheetsStore.getAt(worksheetsStore.find('ID', studentSelModel.getSelection()[0].get('ID')) + 1));
            },
            failure: function (form, action) {
                worksheetForm.setLoading(false);
            }
        });
    }
});
