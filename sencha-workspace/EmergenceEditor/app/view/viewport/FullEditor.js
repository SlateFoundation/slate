Ext.define('EmergenceEditor.view.viewport.FullEditor', {
    extend: 'Ext.container.Container',
    requires: [
        'EmergenceEditor.view.TabPanel',

        'Ext.layout.container.Border'
    ],


    layout: 'fit',

    items: [{
        xtype: 'emergence-tabpanel',
        tabBar: {
            hidden: true
        },
        stateful: false,
        listeners: {
            tabchange: function(tabPanel) {
                tabPanel.getTabBar().show();
            },
            remove: function(tabPanel) {
                if (tabPanel.items.getCount() == 1) {
                    tabPanel.getTabBar().hide();
                }
            }
        }
    }]
});