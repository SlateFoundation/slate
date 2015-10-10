/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.sbg.narratives.Manager',{
    extend: 'Ext.Container',
    xtype: 'sbg-narratives-manager',
    requires: [
        'SlateAdmin.view.sbg.narratives.Grid',
        'SlateAdmin.view.sbg.narratives.StudentsGrid',
        'SlateAdmin.view.sbg.narratives.Editor'
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
        xtype: 'sbg-narratives-grid',
        width: 250
    },{
        region: 'center',
        xtype: 'sbg-narratives-studentsgrid',
        disabled: true,
        width: 250
    },{
        region: 'east',
        split: true,
        xtype: 'sbg-narratives-editor',
        trackResetOnLoad: true,
        disabled: true,
        flex: 1
    }],


    //helper functions
    updateNarrative: function(narrative){
        this.down('sbg-narratives-editor').loadRecord(narrative);
    }
});
