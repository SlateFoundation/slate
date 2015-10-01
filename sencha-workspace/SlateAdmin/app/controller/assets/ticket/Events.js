/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('Slate.controller.asset.ticket.Events', {
	extend: 'Ext.app.Controller'
	
    ,views: [
        'assets.tickets.details.Events'
        ,'assets.tickets.details.event.CreateWindow'
        ,'activity.Create'
    ]
    ,stores: [
		'assets.tickets.Activity'	
    ]
    ,refs: [{
        ref: 'assetTicketsManager'
        ,selector: 'assets-tickets-manager'
        ,xtype: 'assets-tickets-manager'
	},{
		ref: 'ticketEventPanel'
		,selector: 'assets-tickets-details-events'
	},{
		ref: 'ticketEventCreateWindow'
		,autoCreate: true
		,selector: 'assets-tickets-details-event-createwindow'
		,xtype: 'assets-tickets-details-event-createwindow'
	},{
		ref: 'activityCreateWindow'
		,autoCreate: true
		,selector: 'activity-create'
		,xtype: 'activity-create'
	}]	
	,init: function() {
		var me = this;
		
		me.control({
            'assets-tickets-details-events':{
				activate: {fn:me.onEventsActivate, delay: 10}
            }
            ,'assets-tickets-details-events button[action=addTicketEvent]': {
				click: me.onAddTicketEvent
			}
		});
		
		me.application.on('assetticketselected', me.loadTicket, me);
	}
	
	
	//event handlers
	,onEventsActivate: function(){
		var ticket = this.getAssetTicketsManager().getTicket();
		
		if(ticket){
			this.loadTicket(ticket);
		}
	}
	
	,onAddTicketEvent: function(){
		var ticket = this.getAssetTicketsManager().getTicket()
			,createWindow = this.getActivityCreateWindow();
			
		createWindow.setContext(ticket);
		createWindow.setSubmitUrl('/tickets/json/' + ticket.get('ID') + '/activity/create');
		createWindow.setController('asset.ticket.Events');
		createWindow.setHandler('onTicketActivityCreated');
		createWindow.show();
	}
	
	
	//helper functions
	,loadTicket: function(ticket){	
		var panel = this.getTicketEventPanel();

		Ext.getStore('assets.tickets.Activity').load({
			url: '/tickets/json/' + ticket.get('ID') + '/activity'
		});
		
		panel.enable();
	}
	
	,onTicketActivityCreated: function(ticket) {
		this.loadTicket(ticket);
	}
});