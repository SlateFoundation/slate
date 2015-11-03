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
        split: true,
        xtype: 'progress-narratives-sectionsgrid',
        width: 250
    },{
        region: 'center',
        xtype: 'progress-narratives-studentsgrid',
        disabled: true,
        width: 250
    },{
        region: 'east',
        split: true,
        xtype: 'progress-narratives-editorform',
        trackResetOnLoad: true,
        disabled: true,
        flex: 1
    }]
});