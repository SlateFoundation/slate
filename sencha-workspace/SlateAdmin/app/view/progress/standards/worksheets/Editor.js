/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.progress.standards.worksheets.Editor', {
    extend: 'Ext.form.Panel', 
    xtype: 'progress-standards-worksheets-editor',
    requires: [
        'Ext.form.field.Display',
        'Ext.form.field.ComboBox',
        'Ext.form.field.HtmlEditor',
        'SlateAdmin.view.progress.standards.worksheets.PromptsGrid'
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
    componentCls: 'progress-standards-worksheets-editor',
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
