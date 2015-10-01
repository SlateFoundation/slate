/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.details.Events', {
	extend: 'Ext.Panel'
	,xtype: 'assets-details-events'
    ,requires: [
        'SlateAdmin.template.ActivityList'
    ]

	,cls: 'assets-details-events'
	,title: 'Events'
	,layout: {
		type: 'vbox'
		,align:'stretch'
	}
	,dockedItems: [{
		xtype: 'button'
		,docked: 'top'
		,text: 'Add Note'
		,action: 'addAssetActivity'
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
			,store: 'assets.Activity'
			,autoScroll: true
			,emptyText: 'There are currently no events for this Asset.'
			,tpl: Ext.create('SlateAdmin.template.ActivityList')
		}];
	}
});
