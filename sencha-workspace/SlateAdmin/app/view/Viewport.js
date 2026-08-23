Ext.define('SlateAdmin.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'SlateAdmin.view.Main'
    ],

    layout: 'fit',
    items: [{
        xtype: 'slateadmin-main'
    }]
});
