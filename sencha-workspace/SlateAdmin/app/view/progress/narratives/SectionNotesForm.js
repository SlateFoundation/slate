/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.narratives.SectionNotesForm',{
    extend: 'Ext.form.Panel',
    xtype: 'progress-narratives-sectionnotesform',
    requires: [
        'Ext.form.field.TextArea'
    ],


    title: 'Section Notes',
    bodyPadding: 10,
    trackResetOnLoad: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    defaults: {
        anchor: '100%',
        labelAlign: 'top'
    },
    items: [{
        xtype: 'textareafield',
        name: 'Notes',
        flex: 1,
        emptyText: 'Optional notes to include in every student\'s report'
    }],
    buttons: [{
        itemId: 'revertBtn',

        text: 'Revert'
    },{
        itemId: 'saveBtn',

        text: 'Save'
    }]
});