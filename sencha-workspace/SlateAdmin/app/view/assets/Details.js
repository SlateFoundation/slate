Ext.define('SlateAdmin.view.assets.Details', {
    extend: 'Ext.Container',
    xtype: 'assets-details',
    requires: [
        'Ext.form.FormPanel',
        'SlateAdmin.view.assets.Activity',
        'SlateAdmin.view.assets.details.Form',
        'SlateAdmin.view.assets.TicketsGrid'
    ],
    
    autoScroll: true,
    
    items: [{
        xtype: 'assets-details-form'
    },{
        xtype: 'assets-ticketsgrid'
    },{
        xtype: 'assets-activity',
        header: {
            border: false
        },
        bodyPadding: '10 10 0',
        bodyStyle: {
            background: 'none',
			border: 0
        }
    }]
});