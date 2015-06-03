Ext.define('SlateAdmin.view.tickets.Details', {
    extend: 'Ext.Container',
    xtype: 'tickets-details',
    requires: [
        'Ext.form.FormPanel',
        'SlateAdmin.view.tickets.Activity',
        'SlateAdmin.view.tickets.details.Form',
        'SlateAdmin.view.tickets.details.Asset'
    ],
    
    autoScroll: true,
    
	defaults: {
		collapsible: false
	},

    items: [{
        xtype: 'tickets-details-form'
    },{
        xtype: 'tickets-details-asset'
    },{
        xtype: 'tickets-activity',
        bodyPadding: '10 10 0',
        bodyStyle: {
            background: 'none',
            border: 'none'
        }
    }]
});