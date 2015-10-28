/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.controller.sbg.Worksheets', {
    extend: 'Ext.app.Controller',

    views: [
        'sbg.standards.worksheets.Manager'
    ],
    stores: [
        'sbg.standards.Worksheets',
        'sbg.standards.Prompts'
    ],
    refs: {
        worksheetGrid: 'sbg-standards-worksheets-grid',
        worksheetEditor: 'sbg-standards-worksheets-editor',
        promptsGrid: 'sbg-standards-worksheets-promptsgrid',
        worksheetsManager: {
            selector: 'sbg-standards-worksheets-manager',
            autoCreate: true,

            xtype: 'sbg-standards-worksheets-manager'
        }
    },
    routes: {
        'progress/standards/worksheets': 'showStandardsWorksheets'
    },
    init: function () {
        var me = this;

        me.application.on('login', me.syncWorksheets, me);
        me.application.on('login', me.syncPrompts, me);
    },

    control: {
        'sbg-standards-worksheets-manager': {
            activate: 'onWorksheetsActivate'
        },
        'sbg-standards-worksheets-grid': {
            itemclick: 'onWorksheetClick'
            // edit: 'onStandardsWorksheetEdit'
        },
        'sbg-standards-worksheets-grid button[action=createWorksheet]': {
            click: 'onAddWorksheetClick'
        },
        'sbg-standards-worksheets-promptsgrid button[action=addPrompt]': {
            click: 'onAddPromptClick'
        },
        'sbg-standards-worksheets-promptsgrid button[action=disableWorksheet]': {
            click: 'onDisableWorksheetClick'
        },
        'sbg-standards-worksheets-promptsgrid': {
            itemdeleteclick: 'onPromptDeleteClick',
            edit: 'onWorksheetPromptEdit'
        },
        'sbg-standards-worksheets-editor textareafield': {
            change: {
                fn: 'onDescriptionChange',
                buffer: 2000
            },
            keypress: 'onDirtyDescription'
        }
    },


    //route handlers
    showStandardsWorksheets: function () {
        this.application.getController('Viewport').loadCard(this.getWorksheetsManager());
    },


    //event handlers
    onPromptDeleteClick: function (index) {
        var record = Ext.getStore('sbg.standards.Prompts').getAt(index),
            editor = this.getWorksheetEditor();

        Ext.MessageBox.confirm('Deleting Prompt', 'Are you absolutely sure you want to delete this prompt. You won\'t be able to see it again.', function (value) {
            if (value == 'yes') {
                editor.setLoading('Deleting&hellip;');
                record.destroy({
                    callback: function () {
                        editor.setLoading(false);
                    }
                });
            }
        }, this);
    },

    onDirtyDescription: function (field) {
        field.addClass('dirty').removeCls('saved');
    },

    onWorksheetsActivate: function () {
        Ext.getStore('sbg.standards.Worksheets').load();
    },

    onAddWorksheetClick: function () {
        var store = Ext.getStore('sbg.standards.Worksheets'),
            worksheetGrid = this.getWorksheetGrid(),
            phantomWorksheet = store.insert(0, [{
                Title: '',
                Status: 'Live'
            }])[0];

        worksheetGrid.getPlugin('worksheetEditing').startEdit(phantomWorksheet, 0);
    },

    onWorksheetClick: function (grid, record) {
        var editor = this.getWorksheetEditor(),
            store = Ext.getStore('sbg.standards.Prompts'),
            proxy = store.getProxy(),
            worksheetId = record.get('ID');

        this.getWorksheetsManager().updateWorksheet(record);
        editor.enable();

        if (worksheetId) {
            proxy.setExtraParam('WorksheetID', worksheetId);
            store.load();
        }
    },

    onStandardsWorksheetEdit: function (editor, e) {
        var record = e.record,
            grid = this.getWorksheetGrid();

        if (record.dirty) {
            grid.setLoading('Saving&hellip;');

            record.save({
                success: function (record) {
                    grid.setLoading(false);
                },
                failure: function () {
                    grid.setLoading(false);
                }
            });
        }
    },

    onDescriptionChange: function (field) {
        var worksheetEditor = this.getWorksheetEditor(),
            form = worksheetEditor.getForm();

        if (worksheetEditor) {
            form.updateRecord();

            form.getRecord().save({
                success: function () {
                    field.removeCls('dirty').addCls('saved');
                }
            });
        }
    },

    onAddPromptClick: function () {
        var store = Ext.getStore('sbg.standards.Prompts'),
            manager = this.getWorksheetsManager(),
            grid = this.getPromptsGrid(),
            phantomPrompt = store.add({
                WorksheetID: manager.getWorksheet().get('ID')
            })[0];

            grid.getPlugin('promptEditing').startEdit(phantomPrompt, 0);
    },

    onWorksheetPromptEdit: function (editor, e) {
        var record = e.record,
            grid = this.getPromptsGrid();

        if (record.dirty) {
            grid.setLoading('Saving&hellip;');

            record.save({
                success: function (record) {
                    grid.setLoading(false);
                },
                failure: function () {
                    grid.setLoading(false);
                }
            });
        }
    },

    onDisableWorksheetClick: function () {
        Ext.MessageBox.confirm('Disabling Worksheet', 'Are you absolutely sure you want to disable this worksheet. You won\'t be able to see it again.', function (value) {
            var editor = this.getWorksheetEditor(),
                record = this.getWorksheetsManager().getWorksheet();

            if (value == 'yes') {
                record.set('Status', 'Hidden');

                Ext.getStore('sbg.standards.Worksheets').load();

                editor.disable();
            }
        }, this);
    },

    //helper functions
    syncWorksheets: function () {
        var grid = this.getWorksheetGrid(),
            store = Ext.getStore('sbg.standards.Worksheets');

        if (grid) {
            grid.setLoading('Syncing&hellip;');

            store.sync({
                success: function () {
                    grid.setLoading(false);
                },
                failure: function () {
                    grid.setLoading(false);
                }
            });
        }
    },

    syncPrompts: function () {
        var grid = this.getPromptsGrid(),
            manager = this.getWorksheetsManager(),
            worksheet = manager ? manager.getWorksheet() : false,
            store = Ext.getStore('sbg.standards.Prompts');

        if (grid && worksheet) {

            store.getProxy().setExtraParam('WorksheetID', worksheet.get('ID'));
            store.sync();
        }
    }
});
