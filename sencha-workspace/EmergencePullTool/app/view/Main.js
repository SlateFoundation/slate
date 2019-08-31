Ext.define('EmergencePullTool.view.Main', {
    extend: 'Ext.container.Container',
    xtype: 'app-mainview',
    requires: [
        'Ext.layout.container.Border',
        'EmergencePullTool.view.ChangesGrid',
        'EmergencePullTool.view.DiffPanel'
    ],

    layout: {
        type: 'border'
    },

    items: [{
        xtype: 'app-changesgrid',
        region: 'center'
    }, {
        xtype: 'app-diffpanel',
        title: 'Select change to view differences',
        region: 'south',
        height: '40%',
        collapsible: true,
        split: true,
        html: 'diff goes here'
    }]
});