Ext.define('EmergenceEditor.view.viewport.IDE', {
    extend: 'Ext.container.Container',
    requires: [
        'EmergenceEditor.view.Toolbar',
        'EmergenceEditor.view.FilesystemTree',
        'EmergenceEditor.view.TabPanel',
        'EmergenceEditor.view.RevisionsGrid',

        'Ext.layout.container.Border'
    ],


    layout: 'border',

    items: [{
        region: 'west',
        split: true,

        xtype: 'emergence-filesystemtree',
        width: 200,
        collapsible: true
    }, {
        region: 'center',

        xtype: 'emergence-tabpanel',
        dockedItems: [{
            dock: 'top',

            xtype: 'emergence-toolbar'
        }]
    }, {
        region: 'east',
        split: true,

        xtype: 'emergence-revisionsgrid',
        width: 275,
        disabled: true,
        collapsible: true,
        collapsed: true
    }]
});