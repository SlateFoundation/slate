/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.tickets.Manager', {
	extend: 'Ext.container.Container'
	,alias: 'widget.assets-tickets-manager'
	,requires: [
		'Ext.tab.Panel'
		,'SlateAdmin.view.assets.tickets.Grid'
		,'SlateAdmin.view.assets.tickets.Header'
		,'SlateAdmin.view.assets.tickets.details.Editor'
		,'SlateAdmin.view.assets.tickets.details.Events'
	]

	,layout: {
        type: 'hbox'
        ,align: 'stretch'
	}
	,config: {
		ticket: null
	}
	,items: [{
		xtype: 'assets-tickets-grid'
		,flex: 1
	},{
		xtype: 'panel'
		,layout: {
			type: 'vbox'
			,align: 'stretch'
		}
		,width: 400
		,items: [{
			xtype: 'assets-tickets-header'
			,height: 200
		},{
			xtype: 'tabpanel'
			,flex: 1
			,tabBar: {
				ui: 'plain'
				,defaults: {
					flex: 1
				}
            }
            ,items: [{
				xtype: 'assets-tickets-details-editor'
				,disabled: true
            },{
				xtype: 'assets-tickets-details-events'
				,disabled: true
            }]
		}]
	}]


	//helper functions
	,updateTicket: function(ticket){
		this.down('assets-tickets-header').update(ticket.getData());
	}
});
