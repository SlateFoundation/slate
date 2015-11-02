/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.narratives.Manager',{
    extend: 'Ext.Container',
    xtype: 'progress-narratives-manager',
    requires: [
        'SlateAdmin.view.progress.narratives.SectionsGrid',
        'SlateAdmin.view.progress.narratives.StudentsGrid',
        'SlateAdmin.view.progress.narratives.Editor'
    ],

    layout: 'border',
    componentCls: 'progress-narratives-manager',
    config: {
        narrative: null,
        narrativeSaved: true,
        section: null
    },
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
        xtype: 'progress-narratives-editor',
        trackResetOnLoad: true,
        disabled: true,
        flex: 1
    }],


    //helper functions
    updateNarrative: function(narrative){
        this.down('progress-narratives-editor').loadRecord(narrative);
    }
});
