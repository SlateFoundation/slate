/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.tickets.details.Events', {
	extend: 'Ext.Panel'
	,xtype: 'assets-tickets-details-events'
	,requires: [
		'SlateAdmin.template.ActivityList'
	]

	,cls: 'assets-tickets-details-events'
	,title: 'Events'
	,layout: {
		type: 'vbox'
		,align:'stretch'
	}
	,dockedItems: [{
		xtype: 'button'
		,docked: 'top'
		,text: 'Add Activity'
		,action: 'addTicketEvent'
	}]

	// Must dynamically create items in order to set custom tpl's. Still looking for a better practice.
	,initComponent: function() {
		this.items = this.getItems();

		this.callParent(arguments);
	}
	,getItems: function(){
		return [{
			xtype: 'dataview'
			,itemId: 'eventList'
			,itemSelector: 'li.ticket-event'
			,layout: 'fit'
			,store: 'assets.tickets.Activity'
			,autoScroll: true
			,tpl: Ext.create('Slate.template.ActivityList')
			,emptyText: 'There are no events for this ticket.'
		}];
	}
});
