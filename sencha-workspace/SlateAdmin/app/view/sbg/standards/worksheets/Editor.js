/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.sbg.standards.worksheets.Editor', {
    extend: 'Ext.form.Panel',
    xtype: 'sbg-standards-worksheets-editor',
    requires: [
        'Ext.form.field.Display',
        'Ext.form.field.ComboBox',
        'Ext.form.field.HtmlEditor',
        'SlateAdmin.view.sbg.standards.worksheets.PromptsGrid'
    ],

    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    defaults: {
        labelWidth: 70,
        labelAlign: 'right',
        anchor: '100%'
    },
    disabled: true,
    title: 'Interim Report',
    componentCls: 'sbg-standards-worksheets-editor',
    items: [{
        xtype: 'textareafield',
        enableKeyEvents: true,
        emptyText: 'Worksheet Description (optional)',
        name: 'Description',
        itemId: 'Description'
    }, {
        xtype: 'progress-standards-worksheets-promptsgrid',
        flex: 1
    }]
});
