/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.sbg.standards.worksheets.Grid', {
    extend: 'Ext.grid.Panel',
    xtype: 'sbg-standards-worksheets-grid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.grid.column.Date',
        'Ext.grid.feature.Grouping',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox'
    ],

    store: 'sbg.standards.Worksheets',
    componentCls: 'sbg-standards-worksheets-grid',
    tbar: [{
        xtype: 'button',
        text: 'Create Worksheet',
        action: 'createWorksheet',
        flex: 1
    }],
    plugins: [{
        ptype: 'cellediting',
        clicksToEdit: 2,
        pluginId: 'worksheetEditing'
    }],
    columns: [{
        id: 'Title',
        header: 'Title',
        dataIndex: 'Title',
        flex: 1,
        editor: {
            xtype: 'textfield',
            allowBlank: false
        },
        renderer: function (v, metaData, r) {
            if (r.get('Status') != 'Live') {
                metaData.css = 'x-form-empty-field';
            }
            return v;
        }
    }]
});
