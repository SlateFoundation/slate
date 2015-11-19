/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.narratives.Manager',{
    extend: 'Ext.Container',
    xtype: 'progress-narratives-manager',
    requires: [
        'SlateAdmin.view.progress.narratives.SectionsGrid',
        'SlateAdmin.view.progress.narratives.StudentsGrid',
        'SlateAdmin.view.progress.narratives.EditorForm'
    ],

    layout: 'border',
    componentCls: 'progress-narratives-manager',
    items: [{
        region: 'west',
        weight: 100,
        split: true,

        xtype: 'progress-narratives-sectionsgrid'
    },{
        region: 'center',

        xtype: 'progress-narratives-studentsgrid',
        disabled: true
    },{
        region: 'east',
        split: true,
        weight: 100,
        flex: 1,

        xtype: 'progress-narratives-editorform',
        disabled: true
    }]
});