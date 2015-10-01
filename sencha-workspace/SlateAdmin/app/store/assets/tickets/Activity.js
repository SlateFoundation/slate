/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.assets.tickets.Activity',{
	extend: 'Ext.data.Store'

	,requires: ['SlateAdmin.model.Activity']
	,storeId: 'assets.tickets.Activity'
	,model: 'SlateAdmin.model.Activity'
	,sorters: [{
		property: 'Created'
		,direction: 'DESC'
	}]
	,proxy: {
		type: 'ajax'
		,url: '/activity/json'
		,reader: {
			type: 'json'
			,root: 'data'
		}
	}
});
